import React from 'react'
import { i18n } from '../../../../config'
import SubsectionElement from '../../SubsectionElement'
import { LegalAssociationsOverthrowValidator, OverthrowValidator } from '../../../../validators'
import { Summary, DateSummary } from '../../../Summary'
import { Accordion, Branch, Show } from '../../../Form'
import MembershipOverthrowItem from './MembershipOverthrowItem'

export default class MembershipOverthrow extends SubsectionElement {
  constructor (props) {
    super(props)

    this.update = this.update.bind(this)
    this.updateBranch = this.updateBranch.bind(this)
    this.updateList = this.updateList.bind(this)
  }

  update (queue) {
    this.props.onUpdate({
      List: this.props.List,
      ListBranch: this.props.ListBranch,
      HasOverthrow: this.props.HasOverthrow,
      ...queue
    })
  }

  updateList (values) {
    this.update({
      List: values.items,
      ListBranch: values.branch
    })
  }

  updateBranch (values) {
    this.update({
      HasOverthrow: values,
      List: values === 'Yes' ? this.props.List : [],
      ListBranch: values === 'Yes' ? this.props.ListBranch : ''
    })
  }

  summary (item, index) {
    const o = ((item && item.Item) || {})
    const dates = DateSummary(o.Dates)
    const details = (o.Organization || {}).value || ''

    return Summary({
      type: i18n.t('legal.associations.overthrow.collection.item'),
      index: index,
      left: details,
      right: dates,
      placeholder: i18n.m('legal.associations.overthrow.collection.unknown')
    })
  }

  render () {
    return (
      <div className="legal-associations-overthrow">
        <Branch name="has_overthrow"
                label={i18n.t('legal.associations.overthrow.heading.title')}
                labelSize="h3"
                className="legal-associations-overthrow-has-overthrow"
                value={this.props.HasOverthrow}
                warning={true}
                onError={this.handleError}
                validator={OverthrowValidator}
                required={this.props.required}
                onUpdate={this.updateBranch}
                scrollIntoView={this.props.scrollIntoView}>
        </Branch>

        <Show when={this.props.HasOverthrow === 'Yes'}>
          <Accordion defaultState={this.props.defaultState}
                     items={this.props.List}
                     scrollToBottom={this.props.scrollToBottom}
                     branch={this.props.ListBranch}
                     summary={this.summary}
                     onUpdate={this.updateList}
                     onError={this.handleError}
                     description={i18n.t('legal.associations.overthrow.collection.description')}
                     appendTitle={i18n.t('legal.associations.overthrow.collection.appendTitle')}
                     appendLabel={i18n.t('legal.associations.overthrow.collection.appendLabel')}
                     required={this.props.required}
                     scrollIntoView={this.props.scrollIntoView}>
                     <MembershipOverthrowItem name="Item"
                       bind={true}
                       required={this.props.required}
                       scrollIntoView={this.props.scrollIntoView}
                       addressBooks={this.props.addressBooks}
                       dispatch={this.props.dispatch}
                     />
          </Accordion>
        </Show>
      </div>
    )
  }
}

MembershipOverthrow.defaultProps = {
  name: 'overthrow',
  HasOverthrow: '',
  List: [],
  ListBranch: '',
  defaultState: true,
  onUpdate: (queue) => {},
  onError: (value, arr) => { return arr },
  section: 'legal',
  subsection: 'associations/membership-overthrow',
  addressBooks: {},
  dispatch: (action) => {},
  validator: (state, props) => {
    return new LegalAssociationsOverthrowValidator(props).isValid()
  },
  scrollToBottom: ''
}
