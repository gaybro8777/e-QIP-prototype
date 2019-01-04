import React from 'react'
import { connect } from 'react-redux'
import { i18n } from '../../../config'
import ValidationElement from '../ValidationElement'
import Number from '../Number'
import Checkbox from '../Checkbox'
import Show from '../Show'
import {
  today,
  daysAgo,
  daysInMonth,
  extractDate,
  validDate
} from '../../Section/History/dateranges'
import DateControlValidator from '../../../validators/datecontrol'

class DateControl extends ValidationElement {
  constructor(props) {
    super(props)

    this.state = {
      uid: `${this.props.name}-${super.guid()}`,
      disabled: props.disabled,
      estimated: props.estimated,
      error: props.error,
      valid: props.valid,
      maxDate: props.maxDate,
      month: props.hideMonth ? '1' : props.month,
      day: props.hideDay ? '1' : props.day,
      year: props.year,
      touched: props.month >= 1 && props.day >= 1 && props.year >= 1,
      errors: []
    }

    this.storeErrors = this.storeErrors.bind(this)
    this.beforeChange = this.beforeChange.bind(this)
    this.handleError = this.handleError.bind(this)
    this.handleErrorMonth = this.handleErrorMonth.bind(this)
    this.handleErrorDay = this.handleErrorDay.bind(this)
    this.handleErrorYear = this.handleErrorYear.bind(this)
    this.update = this.update.bind(this)
    this.updateMonth = this.updateMonth.bind(this)
    this.updateDay = this.updateDay.bind(this)
    this.updateYear = this.updateYear.bind(this)
    this.updateEstimated = this.updateEstimated.bind(this)
    this.handleDisable = this.handleDisable.bind(this)
    this.errors = []
  }

  componentWillReceiveProps(next) {
    if (next.disabled !== this.state.disabled) {
      this.handleDisable(next)
    }
  }

  handleDisable(nextProps) {
    let updates = {}
    let errors = [...this.errors] || []
    // If disabling component, set all errors to null
    if (nextProps.disabled) {
      this.errors = errors.map(err => {
        return {
          code: err.code,
          valid: null,
          uid: err.uid
        }
      })
      updates = { month: '', day: '', year: '' }
    }
    this.props.onError('', this.errors)
    updates = {
      disabled: nextProps.disabled,
      ...updates
    }
    this.setState(updates)
  }

  update(el, year, month, day, estimated, touched) {
    const changed = {
      year: year !== this.state.year,
      month: month !== this.state.month,
      day: day !== this.state.day,
      estimated: estimated !== this.state.estimated,
      touched: touched !== this.state.touched
    }

    this.setState(
      { month: month, day: day, year: year, estimated: estimated, touched: touched },
      () => {
        // Estimate touches the day so we need to toggle focus
        const toggleForEstimation = changed.estimated

        // Potential for typical day out-of-bounds (including leap year)
        const toggleForDay = changed.year || changed.month

        // Any external influence (i.e. clicking `Present` in a date range)
        const toggleForExternal =
          el === null && changed.year && changed.month && changed.day

        // This will force a blur/validation
        if (toggleForEstimation || toggleForDay || toggleForExternal) {
          this.props.toggleFocus(
            window,
            changed,
            el,
            this.refs.day.refs.number.refs.input,
            this.refs.month.refs.number.refs.input
          )
        }

        // Only mark this date control touched when all 3 parts of the date are set
        const touched = month >= 1 && day >= 1 && year >= 1

        this.props.onUpdate({
          name: this.props.name,
          month: `${month}`,
          day: `${day}`,
          year: `${year}`,
          estimated: estimated,
          touched: touched
        })
      }
    )
  }

  updateMonth(values) {
    this.update(
      this.refs.month.refs.number.refs.input,
      this.state.year,
      values.value,
      this.state.day,
      this.state.estimated,
      this.state.touched
    )
  }

  updateDay(values) {
    this.update(
      this.refs.day.refs.number.refs.input,
      this.state.year,
      this.state.month,
      values.value,
      this.state.estimated,
      this.state.touched
    )
  }

  updateYear(values) {
    this.update(
      this.refs.year.refs.number.refs.input,
      values.value,
      this.state.month,
      this.state.day,
      this.state.estimated,
      this.state.touched
    )
  }

  updateEstimated(values) {
    this.update(
      this.refs.estimated.refs.checkbox,
      this.state.year,
      this.state.month,
      this.state.day,
      values.checked,
      this.state.touched
    )
  }

  handleErrorMonth(value, arr) {
    return this.handleError('month', value, arr)
  }

  handleErrorDay(value, arr) {
    return this.handleError('day', value, arr)
  }

  handleErrorYear(value, arr) {
    return this.handleError('year', value, arr)
  }

  handleError(code, value, arr) {
    let original = arr.map(err => {
      return {
        code: `date.${code}.${err.code}`,
        valid: err.valid,
        uid: err.uid
      }
    })

    // Handle required
    arr = original.concat(
      this.constructor.errors
        .filter(err => err.code === 'required')
        .map(err => {
          const props = { ...this.props, ...this.state }
          return {
            code: `date.${err.code}`,
            valid: err.func(null, props),
            uid: this.state.uid
          }
        })
    )

    // Introducing local state to the DateControl so it can determine
    // if there were **any** errors found in other child components.
    this.storeErrors(arr, () => {
      // Get the full date if we can
      const date = validDate(this.state) ? extractDate(this.state) : null

      const existingErr = this.errors.some(e => e.valid === false)

      // If the date is valid and there are no child errors...
      let props = null
      if (date && !existingErr) {
        // Prepare some properties for the error testing
        props = {
          ...this.props,
          ...this.state,
          validator: new DateControlValidator({ ...this.props, ...this.state })
        }
      }

      // Call any `onError` binding with error checking specific to the `DateControl`
      let local = []
      const noneRequiredErrors = this.constructor.errors.filter(
        err => err.code !== 'required'
      )
      local = noneRequiredErrors.map(err => {
        return {
          code: `${this.props.prefix ? this.props.prefix : 'date'}.${err.code}`,
          valid: props === null ? null : err.func(date, props),
          uid: this.state.uid
        }
      })

      this.setState({ error: local.some(x => x.valid === false) }, () => {
        // Pass any local and child errors to bound functions
        this.props.onError(date, [...arr].concat(local))
      })
    })

    // Return the original array of errors to the child control
    return original
  }

  storeErrors(arr = [], callback) {
    for (const e of arr) {
      const idx = this.errors.findIndex(
        x => x.uid === e.uid && x.code === e.code
      )
      if (idx !== -1) {
        this.errors[idx] = { ...e }
      } else {
        this.errors.push({ ...e })
      }
    }

    this.setState({ errors: [...this.errors] }, () => {
      callback()
    })
  }

  beforeChange(value) {
    return value.replace(/\D/g, '')
  }

  monthDisplayText(value, text) {
    return `${value} (${text})`.trim()
  }

  render() {
    let klass = `${
      this.props.hideMonth && this.props.hideDay ? '' : 'datecontrol'
    } ${
      this.state.error && !this.props.overrideError ? 'usa-input-error' : ''
    } ${this.props.className || ''} ${
      this.props.hideMonth ? 'month-hidden' : ''
    } ${this.props.hideDay ? 'day-hidden' : ''}`.trim()
    return (
      <div className={klass}>
        <div>
          <div
            className={`usa-form-group month ${
              this.props.hideMonth === true ? 'hidden' : ''
            }`.trim()}>
            <Number
              id="month"
              name="month"
              ref="month"
              label="Month"
              disabled={this.state.disabled}
              max="12"
              maxlength="2"
              min="1"
              readonly={this.props.readonly}
              required={!this.props.hideMonth && this.props.required}
              step="1"
              receiveProps="true"
              value={this.state.month}
              error={this.state.error}
              onUpdate={this.updateMonth}
              onError={this.handleErrorMonth}
              tabNext={() => {
                this.props.tab(this.refs.day.refs.number.refs.input)
              }}
            />
          </div>
          <div
            className={`usa-form-group day ${
              this.props.hideDay === true ? 'hidden' : ''
            }`}>
            <Number
              id="day"
              name="day"
              ref="day"
              label="Day"
              disabled={this.state.disabled}
              max={daysInMonth(this.state.month, this.state.year)}
              maxlength="2"
              min="1"
              readonly={this.props.readonly}
              step="1"
              receiveProps="true"
              value={this.state.day}
              error={this.state.error}
              onUpdate={this.updateDay}
              onError={this.handleErrorDay}
              tabBack={() => {
                this.props.tab(this.refs.month.refs.number.refs.input)
              }}
              tabNext={() => {
                this.props.tab(this.refs.year.refs.number.refs.input)
              }}
              required={!this.props.hideDay && this.props.required}
            />
          </div>
          <div className="usa-form-group year">
            <Number
              id="year"
              name="year"
              ref="year"
              label="Year"
              disabled={this.state.disabled}
              min="1000"
              max={this.props.maxDate && this.props.maxDate.year}
              maxlength="4"
              pattern={this.props.pattern}
              readonly={this.props.readonly}
              step="1"
              receiveProps="true"
              value={this.state.year}
              error={this.state.error}
              onUpdate={this.updateYear}
              onError={this.handleErrorYear}
              tabBack={() => {
                this.props.tab(this.refs.day.refs.number.refs.input)
              }}
              required={this.props.required}
            />
          </div>
        </div>
        <Show when={this.props.showEstimated}>
          <div className="flags">
            <Checkbox
              name="estimated"
              ref="estimated"
              label="Estimated"
              toggle="false"
              className="estimated"
              value={this.state.estimated}
              checked={this.state.estimated}
              disabled={this.state.disabled}
              onUpdate={this.updateEstimated}
            />
          </div>
        </Show>
      </div>
    )
  }
}

DateControl.defaultProps = {
  name: 'datecontrol',
  disabled: false,
  estimated: false,
  showEstimated: true,
  overrideError: false,
  error: false,
  valid: false,
  hideDay: false,
  hideMonth: false,
  month: '',
  day: '',
  year: '',
  prefix: '',
  noMaxDate: false,
  maxDate: null,
  maxDateEqualTo: false,
  minDate: null,
  minDateEqualTo: false,
  relationship: '',
  toggleFocus: (w, changed, el, day, month) => {
    day.focus()
    day.blur()

    if (el) {
      if (changed.month) {
        month.focus()
      } else if (el.focus) {
        el.focus()
      }
    }
  },
  onUpdate: values => {},
  onError: (value, arr) => {
    return arr
  },
  tab: el => {
    el.focus()
  },
  notApplicable: false
}

DateControl.errors = [
  {
    code: 'required',
    func: (value, props) => {
      if (props.required) {
        return validDate(props)
      }
      return true
    }
  },
  {
    code: 'max',
    func: (value, props) => {
      if (!value || isNaN(value)) {
        return null
      }
      return value && props.validator.validMaxDate()
    }
  },
  {
    code: 'min',
    func: (value, props) => {
      if (!value || isNaN(value)) {
        return null
      }
      return value && props.validator.validMinDate()
    }
  }
]

const mapStateToProps = (state, ownProps) => {
  return state
}

export { DateControl }
export default connect(mapStateToProps)(DateControl)
