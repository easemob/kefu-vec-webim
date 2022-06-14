import styled from 'styled-components'

export const Wrapper = styled.div`
    position: absolute;
    width: ${props => props.top ? '650px' : '100%'};
    height: ${props => props.top ? '650px' : '100%'};
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 4px;
    box-shadow: 0px 0px 10px #ccc;
    background-color: #fff;
    .icon-mini, .icon-close {
        position: absolute;
        top: 5px;
        right: 5px;
        cursor: pointer;
        color: #fff;
        z-index: 100;
    }
    .icon-mini {
        color: #3689f7;
    }
`

export const WaitWrapper = styled.div`
    max-width: 100%;
    margin: 0 auto;
    height: 100%;
    border-radius: 4px;
    background-color: rgba(51, 51, 51, .8);
    color: #fff;
`

export const WaitTitle = styled.div`
    height: 20%;
    display: flex;
    align-items: center;
    justify-content: center;
    h2 {
        font-size: 25px;
        font-weight: normal;
    }
`

export const WaitAgent = styled.div`
    height: 30%;
    font-size: 16px;
`
export const WaitAgentLogo = styled.div`
    text-align: center;
    height: 70%;
    img {
        height: 100%;
        border-radius: 50%;
    }
`

export const WaitAgentDesc = styled.div`
    text-align: center;
    margin-top: 2%;
    box-sizing: border-box;
`

export const WaitTip = styled.p`
    height: 15%;
    padding: 0 10px;
    line-height: 20px;
    text-align: center;
    font-size: 16px;
`

export const WaitOpera = styled.div`
    height: 35%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    div {
        &:first-child {
            width: 90px;
            height: 90px;
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
                    font-size: 60px;
                }
            }
        }
        &:last-child {
            margin-top: 2%;
            text-align: center;
            font-size: 16px;
        }
    }
`


// 视频中
export const CurrentWrapper = styled.div`
    max-width: 998px;
    margin: 0 auto;
    height: 100%;
`

export const CurrentTitle = styled.div`
    height: 10%;
    position: relative;
    font-size: 16px;
    span {
        &:first-child {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
        }
        &:nth-child(2) {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
        }
    }
`

export const CurrentBody = styled.div`
    height: 80%;
    position: relative;
    div {
        cursor: pointer;
        width: 100%;
        height: 100%;
    }
    .pos {
        position: absolute;
        width: 20%;
        height: 20%;
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
    height: 10%;
    display: flex;
    align-items: center;
    justify-content: center;
    div {
        height: 50px;
        width: 50px;
        border-radius: 5px;
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
            &::before {
                font-size: 30px;
            }
        }
        &:last-child, .icon-sound-close, .icon-face-close {
            color: #d7474a;
        }
    }
`

export const CurrentBodyMore = styled.div`
    height: 80%;
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

