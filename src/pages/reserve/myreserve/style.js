import styled from "styled-components";
import s from '@/assets/css/color'

export const Wrapper = styled.div`
    font-size: 15px;
    .current-day {
        background: ${s.theme} !important;
    }
`

export const Header = styled.header`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    border-bottom: 1px solid ${s.border};
    > span {
        flex-basis: 25%;
        min-height: 50px;
        padding: 0 5px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: break-spaces;
        word-break: break-all;
        overflow-wrap: anywhere;
        &.selected {
            color: ${s.theme};
        }
    }
`

export const SevenDays = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: ${s.calendar};
    padding: 10px 0;
    border-bottom: 1px solid ${s.border};
    font-size: 14px;
    > div {
        display: flex;
        align-items: center;
        justify-content: space-around;
        width: 100%;
        > div {
            display: flex;
            flex-direction: column;
            line-height: 35px;
            padding: 0 5px;
            background-color: ${s.white};
            &.selected {
                background-color: ${s.theme};
                color: ${s.white};
            }
            > span {
                text-align: center;
            }
        }
    }
    > span {
        cursor: pointer;
    }
`

export const Container = styled.div`
    
`

export const ReserveRest = styled.div`
    height: 80px;
    line-height: 80px;
    padding: 0 20px;
    display: flex;
    // justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${s.border};
    box-sizing: border-box;
    > span {
        &:last-child {
            margin-left: auto;
        }
        &:nth-child(2) {
            margin-left: 10px;
        }
    }
`

export const ReserveRestTip = styled.span`
    > i {
        color: ${s.red};
        margin: 0 10px;
        font-style: normal;
    }
`

export const ReserveRestButton = styled.span`
    padding: 0 15px;
    color: ${s.white};
    background: ${s.theme};
    border-radius: 5px;
    line-height: 30px;
`

export const ReserveFull = styled.span`
    color: ${s.red};
`

// AddReserve

export const AddContainer = styled.div`

`

export const AddHeader = styled.header`
    line-height: 40px;
    padding-left: 30px;
    border-bottom: 1px solid ${s.border};
`

export const AddContent = styled.div`
    padding: 0 30px;
`

export const AddItem = styled.div`
    line-height: 40px;
    display: flex;
    .adm-input-element {
        background-color: ${s.input};
        font-size: 13px;
        padding: 2px 5px;
    }
    input[readonly] {
        background-color: ${s.white};
    }
`

export const AddItemLabel = styled.span`
    flex-basis: 100px;
`

export const AddButton = styled.div`
    color: ${s.white};
    background-color: ${s.theme};
    line-height: 30px;
    border-radius: 5px;
    width: 100px;
    margin: 10px auto 30px;
    text-align: center;
`
