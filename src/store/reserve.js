import { atom, atomFamily } from "recoil";
import queryString from 'query-string'
import { getVisitorInfo } from "@/assets/storage/cookie";

// const qs = queryString.parse(location.hash.substring(location.hash.indexOf('?') + 1))
const qs = queryString.parse(location.search)

export const tenantIdState = atom({
    key: 'tenantIdState',
    default: qs.tenantId || ''
})

export const visitorInfoState = atomFamily({
    key: 'visitorInfoState',
    default: tenantId =>  tenantId ? getVisitorInfo(tenantId) : null
})

export const showLoginState = atom({
    key: 'showLoginState',
    default: false
})

