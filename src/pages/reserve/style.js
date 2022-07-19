import styled from 'styled-components'

export const Wrapper = styled.div`
    .adm-tabs-tab-wrapper {
        width: 50%;
        &.selected {
            background-color: #2189ff;
        }
        .adm-tabs-tab {
            width: 100%;
            text-align: center;
        }
        .adm-tabs-tab-active {
            color: #fff;
        }
    }
`

export const Header = styled.header`
    height: 50px;
    line-height: 50px;
    padding-left: 20px;
    font-size: 20px;
    border-bottom: 1px solid #ccc;
    box-sizing: border-box;
`
