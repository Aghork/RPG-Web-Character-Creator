import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {changeData} from '../actions';
import {ArchetypeStats} from './index';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import {omit} from 'lodash-es';

class ArchetypeComponent extends React.Component {

	handleSelect = (event) => {
		let value = event.target.value === '' ? null : event.target.value;
		this.props.changeData(value, 'archetype');
		this.props.changeData('', 'archetypeSpecialSkills');
		this.props.changeData(omit(this.props.misc, 'archetypeTalents'), 'misc', false);
	};

	render() {
		const {archetype, archetypes, handleClose, modal} = this.props;
		return (
			<Modal isOpen={modal} toggle={handleClose} style={{overflowY: 'auto'}}>
				<ModalHeader toggle={handleClose}>Select Archetype</ModalHeader>
				<ModalBody className='mx-2'>
					<Input type='select' value={archetype ? archetype : ''} onChange={this.handleSelect}>
						<option value=''/>
						{Object.keys(archetypes).sort().map((key) =>
							<option value={key} key={key}>{archetypes[key].name}</option>
						)}
					</Input>
					<ArchetypeStats/>
				</ModalBody>
				<ModalFooter>
					<Button color='secondary' onClick={handleClose}>Close</Button>
				</ModalFooter>
			</Modal>
		);
	}
}

function mapStateToProps(state) {
	return {
		archetypes: state.archetypes,
		archetype: state.archetype,
		misc: state.misc,
	};
}

function matchDispatchToProps(dispatch) {
	return bindActionCreators({changeData}, dispatch);
}

export const Archetype = connect(mapStateToProps, matchDispatchToProps)(ArchetypeComponent);
