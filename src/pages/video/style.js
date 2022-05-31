import styled from 'styled-components'

export const Wrapper = styled.div`
    position: reletive;
    .icon-mini {
        position: absolute;
        top: ${props => props.role === 'current' ? '15px' : 0};
        right: 0;
        cursor: pointer;
        color: ${props => props.role === 'current' ? 'gray' : 'white'};
        z-index: 100;
    }
`

export const WaitWrapper = styled.div`
    max-width: 998px;
    margin: 0 auto;
    height: 100vh;
    background-color: rgba(51, 51, 51, 1);
    color: #fff;
`

export const WaitTitle = styled.div`
    height: 30vh;
    box-sizing: border-box;
    padding: calc(15vh - 15px) 0;
    h2 {
        height: 30px;
        text-align: center;
        font-weight: normal;
    }
`

export const WaitAgent = styled.div`
    height: 30vh;
`
export const WaitAgentLogo = styled.div`
    text-align: center;
    img {
        height: 20vh;
        width: 20vh;
        border-radius: 50%;
    }
`

export const WaitAgentDesc = styled.div`
    text-align: center;
    margin-top: 2vh;
`

export const WaitTip = styled.p`
    height: 15vh;
    padding: 0 10px;
    line-height: 20px;
    text-align: center;
`

export const WaitOpera = styled.div`
    div {
        &:first-child {
            width: 15vh;
            height: 15vh;
            text-align: center;
            border-radius: 50%;
            margin: 0 auto;
            background: linear-gradient(172deg, ${props => props.role === 'start' ? '#5ef61e' : '#f5515f'} , ${props => props.role === 'start' ? '#44d434' : '#e92744'});
            position: relative;
            cursor: pointer;
            span {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                &::before {
                    font-size: 50px;
                }
            }
        }
        &:last-child {
            margin-top: 2vh;
            text-align: center;
        }
    }
`


// 视频中
export const CurrentWrapper = styled.div`
    max-width: 998px;
    margin: 0 auto;
    height: 100vh;
`

export const CurrentTitle = styled.div`
    height: 10vh;
    line-height: 10vh;
    position: relative;
    span {
        &:first-child {
            position: absolute;
            left: 10px;
        }
        &:nth-child(2) {
            display: block;
            width: 100%;
            height: 100%;
            text-align: center;
        }
    }
`

export const CurrentBody = styled.div`
    height: 80vh;
    position: relative;
    div {
        cursor: pointer;
        width: 100%;
        height: 100%;
    }
    .pos {
        position: absolute;
        width: 20vh;
        height: 20vh;
        top: 10px;
        left: 10px;
        > div {
            &:first-child {
                position: absolute;
                top: 0;
                left: 0;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: #fff;
                color: #3689f7;
                z-index: 10;
                span {
                    line-height: 20px;
                    &::before {
                        font-size: 20px;
                    }
                }
            }
            &:last-child {
                > div {
                    z-index: 5;
                }
            }
        }
    }
    .info {
        height: 30px;
        color: #fff;
        position: absolute;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        z-index: 10;
        > div {
            display: inline-block;
            background-color: #fff;
            color: #3689f7;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 5px;
            span {
                line-height: 20px;
                &::before {
                    font-size: 20px;
                }
            }
        }
        > span {
            height: 30px;
            line-height: 30px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }
    .self {
        z-index: 10;
        color: ${props => props.sound ? '#3689f7' : '#d7474a'} !important;
    }
    .agent {
        color: ${props => props.agentSound ? '#3689f7' : '#d7474a'} !important;
    }
`
export const CurrentBodySelf = styled.div`
    width: 100%;
    height: 100%;
    div {
        width: 100%;
        height: 100%;
    }
    #visitor_video {
        background-color: #000;
    }
    .icon-microphone-close {
        color: #FD3E3F;
    }
    .info {
        height: 30px;
        color: #fff;
        position: absolute;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        z-index: 10;
        > div {
            display: inline-block;
            background-color: #fff;
            color: #3689f7;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 5px;
            span {
                line-height: 20px;
                &::before {
                    font-size: 20px;
                }
            }
        }
        > span {
            height: 30px;
            line-height: 30px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }
`

export const CurrentBodyAgent = styled.div`
    background: #000;
`

export const CurrentBodyMicro = styled.div`

`

export const CurrentFooter = styled.div`
    height: 10vh;
    display: flex;
    align-items: center;
    justify-content: center;
    div {
        height: 7vh;
        width: 7vh;
        border-radius: 10px;
        border: 1px solid #d7d7d7;
        margin: 0 5px;
        position: relative;
        color: #3689f7;
        cursor: pointer;
        span {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        &:last-child, .icon-sound-close, .icon-face-close {
            color: #d7474a;
        }
    }
`

export const CurrentBodyMore = styled.div`
    height: 80vh;
    position: relative;
`

export const TopVideoBox = styled.div`
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    z-index: 99;
    > div {
        margin-right: 10px;
    }
`

export const CurrentVideo = styled.div`
    height: 100%;
    width: 100%;
    position: relative;
`

