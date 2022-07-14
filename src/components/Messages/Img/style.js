import styled from "styled-components";

export const Content = styled.img`
    align-self: flex-${props => props.pos === 'left' ? 'start' : 'end'};
    max-height: 240px;
    border-radius: 12px;
    box-sizing: border-box;
    ${props => props.pos === 'left' ? 'right' : 'left'}: 0;
    border-top-${props => props.pos}-radius: 0;
`
