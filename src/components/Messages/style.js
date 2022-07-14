import styled from "styled-components";

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
`

export const Title = styled.div`
    font-size: 12px;
    color: #808080;
    width: 80%;
    height: 20px;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    justify-content: flex-${props => props.pos === 'left' ? 'start' : 'end'};
    margin-${props => props.pos === 'left' ? 'right' : 'left'}: auto;
    > span {
        &:first-child {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        &:last-child {
            margin-left: 5px;
        }
    }
`

export const Name = styled.span``

export const Time = styled.span``
