import styled from "styled-components"

export const Wrapper = styled.div`
    
`

export const Container = styled.div`
    padding: 15px;
    border-bottom: 1px solid #ccc;
    font-size: 15px;
`

export const Item = styled.div`
    display: flex;
    line-height: 30px;
    > span {
        &:first-child {
            margin-right: 20px;
        }
    }
`

export const Content = styled.span`

`

export const Cancel = styled.span`
    background-color: red;
    color: #fff;
    border-radius: 5px;
    display: inline-block;
    width: 50px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    margin-left: auto;
    cursor: pointer;
`

