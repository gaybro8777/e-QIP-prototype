import React from 'react'
import ValidationElement from '../validationElement'
import Text from '../Text'
import Checkbox from '../Checkbox'
import { api } from '../../../services/api'

export default class ApplicantSSN extends ValidationElement {
  constructor (props) {
    super(props)

    this.state = {
      name: props.name,
      label: props.label,
      value: props.value,
      first: this.ripper(props.value, 0, 3),
      middle: this.ripper(props.value, 3, 5),
      last: this.ripper(props.value, 5, 9),
      notApplicable: props.notApplicable,
      focus: props.focus || false,
      error: props.error || false,
      valid: props.valid || false
    }
  }

  /**
   * Handle the change event.
   */
  handleChange (event) {
    let part = this.extractPart(event.target.id)
    let value = event.target.value
    let updated = null

    switch (part) {
      case 'first':
        updated = {
          first: value,
          value: '' + value + this.state.middle + this.state.last
        }
        if (value.length === 3) {
          this.refs.middle.refs.text.refs.input.focus()
        }
        break
      case 'middle':
        updated = {
          middle: value,
          value: '' + this.state.first + value + this.state.last
        }
        if (value.length === 2) {
          this.refs.last.refs.text.refs.input.focus()
        }
        break
      case 'last':
        updated = {
          last: value,
          value: '' + this.state.first + this.state.middle + value
        }
        break
      case 'notAapplicable':
        updated = {
          notAapplicable: value
        }
        break
    }

    if (updated != null) {
      this.setState(updated, () => {
        super.handleChange(event)
      })
    } else {
      super.handleChange(event)
    }
  }

  /**
   * Handle the validation event.
   */
  handleValidation (event, status) {
    this.setState({error: status === false, valid: status === true}, () => {
      if (this.state.error === false || this.state.valid === true) {
        super.handleValidation(event, status)
        return
      }

      api
        .validateApplicantSSN({
          SSN: this.state.value
        })
        .then((response) => {
          // TODO: Display and assign the errors as necessary
          if (response.Errors) {
          }

          if (response.Suggestions) {
          }
        })
        .then(() => {
          super.handleValidation(event, status)
        })
    })
  }

  ripper (val, start, end) {
    if (!val || val.length === 0 || (val.length - 1) < start) {
      return ''
    }

    if (end > (val.length)) {
      end = val.length
    }

    return val.substring(start, end)
  }

  /**
   * Generated name for the part of the address elements.
   */
  partName (part) {
    return '' + this.state.name + '-' + part
  }

  /**
   * Returns the part name from the pull generated identifier.
   */
  extractPart (id) {
    return id.split('-').pop()
  }

  render () {
    return (
      <div>
        <Text name={this.partName('first')}
              ref="first"
              placeholder="000"
              maxlength="3"
              pattern="^[0-9]*$"
              help=""
              value={this.state.first}
              onChange={this.handleChange}
              onValidate={this.handleValidation}
              onFocus={this.props.onFocus}
              onBlur={this.props.onBlur}
              />
        <Text name={this.partName('middle')}
              ref="middle"
              placeholder="00"
              maxlength="2"
              pattern="^[0-9]*$"
              help=""
              value={this.state.middle}
              onChange={this.handleChange}
              onValidate={this.handleValidation}
              onFocus={this.props.onFocus}
              onBlur={this.props.onBlur}
              />
        <Text name={this.partName('last')}
              ref="last"
              placeholder="0000"
              maxlength="4"
              pattern="^[0-9]*$"
              help=""
              value={this.state.last}
              onChange={this.handleChange}
              onValidate={this.handleValidation}
              onFocus={this.props.onFocus}
              onBlur={this.props.onBlur}
              />
        <Checkbox name={this.partName('notApplicable')}
                  label="Not applicable"
                  ref="notAapplicable"
                  help=""
                  value={this.state.notApplicable}
                  onChange={this.handleChange}
                  onValidate={this.handleValidation}
                  onFocus={this.props.onFocus}
                  onBlur={this.props.onBlur}
                  />
      </div>
    )
  }
}
