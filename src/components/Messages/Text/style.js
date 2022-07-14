import styled from "styled-components";

export const Content = styled.div`
    align-self: flex-${props => props.pos === 'left' ? 'start' : 'end'};
    max-width: 80%;
    color: #222;
    padding: 9px 12px;
    background-color: #DBECFF;
    border-radius: 12px;
    box-sizing: border-box;
    font-size: 14px;
    line-height: 20px;
    ${props => props.pos === 'left' ? 'right' : 'left'}: 0;
    border-top-${props => props.pos}-radius: 0;
    word-break: break-all;
`

