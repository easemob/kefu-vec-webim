import Cookies from 'js-cookie'

export const setVisitorInfo = (tenantId, info) => {
    Cookies.set(`reserve_visitor_${tenantId}`, JSON.stringify(info))
}

export const getVisitorInfo = tenantId => {
    return Cookies.get(`reserve_visitor_${tenantId}`) === undefined ? null : JSON.parse(Cookies.get(`reserve_visitor_${tenantId}`))
}

export const delVisitorInfo = tenantId => {
    Cookies.remove(`reserve_visitor_${tenantId}`)
}
