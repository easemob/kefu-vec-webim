import styled from "styled-components";

export const Wrapper = styled.div`
    font-size: 15px;
    .current-day {
        background: #2189ff !important;
    }
`

export const Header = styled.header`
    height: 50px;
    line-height: 50px;
    padding-left: 20px;
`

export const ReserveButton = styled.button`
    padding: 5px 10px;
    background-color: #fff;
    border-radius: 5px;
    margin-left: 10px;
    border: 1px solid #ccc;
`

export const Container = styled.div`
    
`

export const ReserveRest = styled.div`
    height: 80px;
    line-height: 80px;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    box-sizing: border-box;
`

export const ReserveRestTip = styled.span`
    > i {
        color: red;
        margin: 0 10px;
        font-style: normal;
    }
`

export const ReserveRestButton = styled.span`
    padding: 0 15px;
    color: #fff;
    background: #2189ff;
    border-radius: 5px;
    line-height: 30px;
`

export const ReserveFull = styled.div`
    color: red;
`

// AddReserve

export const AddContainer = styled.div`

`

export const AddHeader = styled.header`
    line-height: 40px;
    padding-left: 30px;
    border-bottom: 1px solid #ccc;
`

export const AddContent = styled.div`
    padding: 0 30px;
`

export const AddItem = styled.div`
    line-height: 40px;
    display: flex;
    .adm-input-element {
        background-color: #f7f7f7;
    }
    input[readonly] {
        background-color: #fff;
    }
`

export const AddItemLabel = styled.span`
    flex-basis: 100px;
`

export const AddButton = styled.div`
    color: #fff;
    background-color: #2189ff;
    line-height: 30px;
    border-radius: 5px;
    width: 100px;
    margin: 10px auto 30px;
    text-align: center;
`
