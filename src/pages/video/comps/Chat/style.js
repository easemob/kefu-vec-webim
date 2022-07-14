import styled from 'styled-components'

export const Container = styled.div`
    height: 100%;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    background-color: #fff;
`
export const Header = styled.header`
    position: relative;
`
export const Title = styled.div`
    font-size: 16px;
    font-weight: 600;
    height: 50px;
    line-height: 50px;
    text-align: center;
`
export const CloseIcon = styled.span`
    position: absolute;
    top: 50% !important;
    right: 12.5px !important;
    transform: translateY(-50%);
    cursor: pointer;
    color: #000 !important;
`
export const Messages = styled.div`
    overflow-y: auto;
    height: calc(100% - 130px);
    padding: 0 10px;
`
export const Footer = styled.div`
    height: 50px;
    margin: 10px 20px 0;
    padding: 0 10px;
    border: 1px solid ${props => props.active ? '#2189ff' : '#ccc'};
    box-sizing: border-box;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .adm-text-area {
        margin: 0 5px;
        display: flex;
        align-items: center;
    }
    .icon-chat-pic  {
        cursor: pointer;
        color: ${props => props.textActive ? '#2189ff' : ''}
    }
`
