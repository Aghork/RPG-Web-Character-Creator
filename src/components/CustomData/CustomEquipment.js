import React from 'react';
import {connect} from 'react-redux';
import {Button, Col, Input, Row, Table} from 'reactstrap';
import {bindActionCreators} from 'redux';
import {changeCustomData} from '../../actions';
import {ControlButtonSet, DeleteButton} from '..';
import {omit} from 'lodash-es';
import {Typeahead} from 'react-bootstrap-typeahead';

const clone = require('clone');

class CustomEquipmentComponent extends React.Component {
	state = {
		name: '',
		damage: '',
		range: '',
		skill: '',
		critical: '',
		encumbrance: '',
		price: '',
		soak: '',
		defense: '',
		setting: [],
		meleeDefense: '',
		rangedDefense: '',
		qualitiesList: '',
		qualityRank: '',
		description: '',
		amount: '',
		specialQualities: '',
		qualityList: {},
		mode: 'add'
	};

	initState = () => {
		this.setState({
			name: '',
			damage: '',
			range: '',
			skill: 'All',
			critical: '',
			encumbrance: '',
			price: '',
			soak: '',
			defense: '',
			setting: [],
			meleeDefense: '',
			rangedDefense: '',
			qualityRank: '',
			description: '',
			specialQualities: '',
			qualityList: {},
			mode: 'add',
		});
	};

	handleClose = () => {
		this.initState();
		this.props.handleClose();
	};

	handleChange = (event) => {
		this.setState({[event.target.name]: event.target.value});
		event.preventDefault();
	};

	handleAddQuality = () => {
		let obj = clone(this.state.qualityList);
		obj[this.state.specialQualities] = this.state.qualityRank ? +this.state.qualityRank : '';
		this.setState({qualityList: obj, specialQualities: '', qualityRank: ''});

	};

	handleSubmit = (event) => {
		const {type, changeCustomData} = this.props;
		const {name, range, damage, skill, critical, encumbrance, price, soak, defense, meleeDefense, rangedDefense, description, qualityList, setting} = this.state;
		let obj = clone(this.props[type]);
		let key = name.replace(/\s/g, '').replace(/[{()}]/g, '');
		if (type === 'customWeapons') obj[key] = {
			name,
			damage,
			range,
			skill,
			critical,
			setting,
			encumbrance,
			price,
			description,
			qualities: qualityList
		};
		if (type === 'customArmor') obj[key] = {
			name,
			soak,
			defense,
			meleeDefense,
			rangedDefense,
			encumbrance,
			price,
			setting,
			description,
			qualities: qualityList
		};
		if (type === 'customGear') obj[key] = {name, encumbrance, price, description, setting, qualities: qualityList};
		changeCustomData(obj, type);
		this.initState();
		event.preventDefault();
	};

	handleDelete = (event) => {
		const {type, changeCustomData} = this.props;
		changeCustomData(omit(this.props[type], event.target.name), type, false);
		event.preventDefault();
	};

	handleEdit = (event, equipment) => {
		event.preventDefault();
		this.setState({...equipment, setting: typeof equipment.setting === 'string' ? equipment.setting.split(', ') : equipment.setting,
			qualityList: equipment.qualities ? equipment.qualities : {}, mode: 'edit'})
	};

	buildField = (field) => {
		const {type, skills, qualities, settings} = this.props;
		switch (field) {
			case 'name':
				return <Input type='text' value={this.state[field]} name={field}
							  onChange={this.handleChange} disabled={this.state.mode === 'edit'}/>;
			case 'damage':
				return (
					<Input type='text' value={this.state[field]} name={field}
						   onChange={this.handleChange}/>
				);
			case 'setting':
				return (
					<Typeahead
						multiple={true}
						options={Object.values(settings)}
						name='setting'
						selected={this.state.setting}
						placeholder='Choose a Setting...'
						clearButton={true}
						onChange={(selected) => this.setState({setting: selected.includes('All') ? ['All'] : selected})}/>
				);
			case 'critical':
			case 'encumbrance':
			case 'price':
			case 'soak':
			case 'defense':
			case 'rangedDefense':
			case 'meleeDefense':
				return (
					<Input type='number' value={this.state[field]} name={field}
						   onChange={this.handleChange}/>
				);
			case 'range':
				return (
					<Input type='select' value={this.state[field]}
						   name='range'
						   onChange={this.handleChange}>
						<option value=''/>
						<option value='Engaged'>Engaged</option>
						<option value='Short'>Short</option>
						<option value='Medium'>Medium</option>
						<option value='Long'>Long</option>
						<option value='Extreme'>Extreme</option>
					</Input>
				);
			case 'skill':
				return (
					<Input type='select' value={this.state[field]}
						   name={field}
						   onChange={this.handleChange}>
						<option value=''/>
						{Object.keys(skills).sort().map(skillKey =>
							skills[skillKey].type === 'Combat' &&
							<option value={skillKey} key={skillKey}>{skills[skillKey].name}</option>
						)}
					</Input>
				);
			case 'specialQualities':
				return (
					<div>
						<Row className='mt-2'>
							<Col sm='4' className='my-auto'><b>Special Qualities:</b></Col>
							<Col>
								<Input type='select'
									   value={this.state[field]}
									   name={field}
									   onChange={this.handleChange}>
									<option value=''/>
									{Object.keys(qualities).map(quality =>
										qualities[quality].type.includes(type.toLowerCase().slice(6)) &&
										<option key={quality} value={quality}>{qualities[quality].name}</option>
									)}
								</Input>
							</Col>
						</Row>
						{this.state.specialQualities &&
						<Row className='my-2'>
							<Col sm='4' className='my-auto'/>
							<Col>
								{qualities[this.state.specialQualities] &&
								qualities[this.state.specialQualities].ranked &&
								<Input type='number' maxLength='2'
									   value={this.state.qualityRank}
									   name='qualityRank'
									   onChange={this.handleChange}/>
								}
							</Col>
							<Col className='text-right'>
								{this.state.specialQualities &&
								<Button onClick={this.handleAddQuality}>Add</Button>
								}
							</Col>
						</Row>
						}
						<Row className='my-2'>
							{Object.keys(this.state.qualityList).map(quality =>
								`${qualities[quality].name} ${this.state.qualityList[quality]}`
							).sort().join(', ')
							}
						</Row>
						{Object.keys(this.state.qualityList).length > 0 &&
						<Row className='text-right'>
							<Button onClick={() => this.setState({qualityList: {}})}>Clear</Button>
						</Row>
						}
					</div>
				);
			case 'description':
				return (
					<textarea onChange={this.handleChange}
							  name={field}
							  rows='8'
							  maxLength='1000'
							  className='w-100'
							  value={this.state[field]}/>
				);
			default:
				return <div/>
		}
	};

	render() {
		const {type} = this.props;
		let fields = [];
		if (type === 'customWeapons') fields = ['name', 'damage', 'critical', 'range', 'skill', 'encumbrance', 'price', 'description', 'setting'];
		if (type === 'customArmor') fields = ['name', 'soak', 'defense', 'rangedDefense', 'meleeDefense', 'encumbrance', 'price', 'description', 'setting'];
		if (type === 'customGear') fields = ['name', 'encumbrance', 'price', 'description', 'setting'];

		if (!type) return <div/>;
		return (
			<div>
				{fields.map(field =>
					<Row className='mt-2' key={field}>
						<Col sm='4' className='my-auto'><b>{field.charAt(0).toUpperCase() + field.slice(1)}:</b></Col>
						<Col>
							{this.buildField(field)}
						</Col>
					</Row>
				)}
				{this.buildField('specialQualities')}
				<ControlButtonSet
					mode={this.state.mode}
					type={type.toString().slice(6)}
					handleSubmit={this.handleSubmit}
					onEditSubmit={this.handleSubmit}
					onEditCancel={this.initState}/>
				<Table>
					<thead>
					<tr>
						<th>NAME</th>
						<th/>
						<th/>
					</tr>
					</thead>
					<tbody>
					{type &&
					Object.keys(this.props[type]).map(key =>
						<tr key={key}>
							<td>{this.props[type][key].name}</td>
							<td className='text-right'>
								<Button name={key}
										onClick={(e) => this.handleEdit(e, this.props[type][key])}>Edit</Button>
							</td>
							<td className='text-right'>
								<DeleteButton name={key} onClick={this.handleDelete}/>
							</td>
						</tr>
					)
					}
					</tbody>
				</Table>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		armor: state.armor,
		weapons: state.weapons,
		gear: state.gear,
		qualities: state.qualities,
		skills: state.skills,
		customWeapons: state.customWeapons,
		customGear: state.customGear,
		customArmor: state.customArmor,
		settings: state.settings,
	};
}

function matchDispatchToProps(dispatch) {
	return bindActionCreators({changeCustomData}, dispatch);
}

export const CustomEquipment = connect(mapStateToProps, matchDispatchToProps)(CustomEquipmentComponent);