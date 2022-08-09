import styled from "styled-components";
import s from '@/assets/css/color'

export const Header = styled.header`
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    color: ${s.white};
    background-color: ${s.theme};
`

export const Body = styled.div`
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
    .adm-input {
        height: 50px;
        border: 1px solid ${s.border};
        border-radius: 5px;
        padding-left: 10px;
        width: 100%;
        box-sizing: border-box;
    }
    > div {
        &:last-child {
            line-height: 50px;
            text-align: center;
            font-size: 20px;
            background-color: ${s.theme};
            color: ${s.white};
            border-radius: 5px;
            cursor: pointer;
        }
    }
`

export const VerCodeWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 20px 0;
    > div {
        &:last-child {
            flex-basis: 210px;
            text-align: center;
            font-size: 16px;
            margin-left: 10px;
            height: 100%;
            line-height: 50px;
            border-radius: 5px;
            background-color: ${props => props.canCode ? s.theme : s.border};
            color: ${props => props.canCode ? s.white : s.font};
            cursor: ${props => props.canCode ? 'pointer' : 'initial'};
            padding: 0 5px;
        }
    }
`


