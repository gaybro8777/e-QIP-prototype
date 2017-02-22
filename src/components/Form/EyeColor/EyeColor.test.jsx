import React from 'react'
import { mount } from 'enzyme'
import EyeColor from './EyeColor'

describe('The EyeColor component', () => {
  it('no error on empty', () => {
    const expected = {
      name: 'eye-color',
      label: 'Text input focused',
      value: ''
    }
    const component = mount(<EyeColor name={expected.name} label={expected.label} value={expected.value} />)
    component.find('input[name="eye-color"]').first().simulate('change')
    expect(component.find('input[name="eye-color"]').length).toEqual(10)
    expect(component.find('.usa-input-error-label').length).toEqual(0)
  })

  it('updates value', () => {
    let updates = 0
    const expected = {
      name: 'eye-color',
      label: 'Text input focused',
      value: '',
      onUpdate: () => { updates++ }
    }
    const component = mount(<EyeColor name={expected.name} label={expected.label} value={expected.value} onUpdate={expected.onUpdate} />)
    component.find('input[name="eye-color"]').first().simulate('change')
    expect(updates).toBeGreaterThan(0)
  })
})
