import React from 'react'
import { ValidationElement, Help, Text, Checkbox, Email, Collection, Comments } from '../../../Form'
import { api } from '../../../../services/api'

export default class ContactInformation extends ValidationElement {
  constructor (props) {
    super(props)
    this.state = {
      name: props.name,
      label: props.label,
      value: props.value,
      focus: props.focus || false,
      error: props.error || false,
      valid: props.valid || false,
      errorCodes: [],
      Comments: props.Comments,
      EmailList: []
    }
  }

  /**
   * Handle the change event.
   */
  handleChange (event) {
  }

  /**
   * Handle the key down event.
   */
  handleKeyDown (event) {
  }

  emailDispatch (collection) {
    this.handleUpdate('EmailList', collection)
  }

  handleUpdate (field, values) {
    this.setState({ [field]: values }, () => {
      if (this.props.onUpdate) {
        this.props.onUpdate({
          EmailList: this.state.EmailList,
          Comments: this.state.Comments
        })
      }
    })
  }

  /**
   * Handle the validation event.
   */
  handleValidation (event, status, error) {
    if (!event) {
      return
    }

    let codes = super.mergeError(this.state.errorCodes, super.flattenObject(error))
    let complexStatus = null
    if (codes.length > 0) {
      complexStatus = false
    } else if (this.isValid()) {
      complexStatus = true
    }

    this.setState({error: complexStatus === false, valid: complexStatus === true, errorCodes: codes}, () => {
      let e = { [this.props.name]: codes }
      let s = { [this.props.name]: { status: complexStatus } }
      if (this.state.error === false || this.state.valid === true) {
        super.handleValidation(event, s, e)
        return
      }
      super.handleValidation(event, s, e)
    })
  }

  isValid () {
    return true
  }

  render () {
    return (
      <div className="contact">

        <div className="eapp-field-wrap">
          <h2>Your e-mail addresses</h2>
          <Collection minimum="1"
            items={this.state.EmailList}
            dispatch={this.emailDispatch.bind(this)}
            appendLabel="Add another email">
            <Email name="Email"
              onValidate={this.handleValidation}
              placeholder="Enter an email address"
            />
          </Collection>
        </div>

        <div className="eapp-field-wrap">
          <h2>Add optional comment</h2>
          <Comments name="comments"
            {...this.state.Comments}
            label="If you need to provide any additional comments about this information enter them below"
            onUpdate={this.handleUpdate.bind(this, 'Comments')}
            onValidate={this.handleValidation}
          />
        </div>

      </div>
    )
  }
}
