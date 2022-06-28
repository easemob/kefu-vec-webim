import styled from 'styled-components'

export const RoomWhite = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
`

export const RoomControllerBox = styled.div`
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 100;
`
export const RoomControllerMidBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    height: 32px;
    padding-left: 4px;
    padding-right: 4px;
    border-radius: 4px;
    user-select: none;
    font-size: 12px;
    box-shadow: 0 4px 12px 0 rgb(0 0 0 / 10%);
`
export const PagePreviewCell = styled.div`
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: white;
    border-radius: 2px;
    &:hover {
        background: rgba(33, 35, 36, 0.1);
    }
    > img {
        cursor: pointer;
    }
`
