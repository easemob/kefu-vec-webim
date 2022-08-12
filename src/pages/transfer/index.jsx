
import React, { useEffect, useState } from "react"
import Wrapper from '@/components/Wrapper'
import Loading from '@/components/Loading'
import errImg from '@/assets/img/u1447.png'
import { ErrContainer } from './style'
import { codeInfo } from '@/assets/http/transfer'
import queryString from 'query-string'
import intl from 'react-intl-universal'

export default function Transfer() {
    const [load, setLoad] = useState(true)
    const [tip, setTip] = useState('')

    const getCodeInfo = async () => {
        let hashOps = queryString.parse(location.hash.substring(location.hash.indexOf('?')))
        const data = await codeInfo(hashOps.code)
        if (data.status && data.status === 'OK') {
            let p = {
                businessType: data.entity.businessType
            }
            switch (data.entity.businessType) {
                case 'OneClickInvitation-Vec': // 一键邀请
                    p.extra = JSON.stringify(data.entity.extra)
                    break;
                case 'SubscribeTask-Vec':
                    break;
                default:
                    break;
            }
            window.location.href = data.entity.fullUrl + '&' +  queryString.stringify(p)
        } else {
            setLoad(false)
            setTip(intl.get(data.errorCode))
        }
    }

    useEffect(() => {
        getCodeInfo()
    }, [])

    return <Wrapper>
        {load ? <Loading /> : (
            <ErrContainer>
                <img src={errImg} />
                <span>{tip}</span>
            </ErrContainer>
        )}
    </Wrapper>
}
