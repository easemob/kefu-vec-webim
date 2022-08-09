import styled from "styled-components"
import s from '@/assets/css/color'

export const Wrapper = styled.div`
    
`

export const Container = styled.div`
    padding: 15px;
    border-bottom: 1px solid ${s.border};
    font-size: 15px;
`

export const Item = styled.div`
    display: flex;
    align-items: center;
    line-height: 35px;
    > span {
        &:first-child {
            margin-right: 20px;
        }
    }
`

export const Content = styled.span`

`

export const Cancel = styled.span`
    background-color: ${s.red};
    color: ${s.white};
    border-radius: 5px;
    display: inline-block;
    width: 50px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    margin-left: auto;
    cursor: pointer;
`

