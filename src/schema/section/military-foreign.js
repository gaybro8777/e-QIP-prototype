import * as form from '../form'

export const militaryForeign = (data = {}) => {
  const items = ((data.List || {}).items || []).map(x => {
    const xitem = x.Item || {}
    return {
      Item: {
        Organization: form.radio(xitem.Organization),
        Name: form.text(xitem.Name),
        Dates: form.daterange(xitem.Dates),
        Country: form.country(xitem.Country),
        Rank: form.text(xitem.Rank),
        Division: form.text(xitem.Division),
        Circumstances: form.textarea(xitem.Circumstances),
        ReasonLeft: form.textarea(xitem.ReasonLeft),
        MaintainsContact: form.branch(xitem.MaintainsContact),
        List: form.collection(((xitem.List || {}).items || []).map(y => {
          const yitem = y.Item || {}
          return {
            Item: {
              Name: form.name(yitem.Name),
              Address: form.location(yitem.Address),
              Title: form.text(yitem.Title),
              Dates: form.daterange(yitem.Dates),
              Frequency: form.text(yitem.Frequency)
            }
          }
        }))
      }
    }
  })
  return {
    List: form.collection(items)
  }
}
