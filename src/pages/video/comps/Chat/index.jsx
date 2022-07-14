import React, { useEffect, useRef, useState } from "react";
import { Container, Header, Title, CloseIcon, Messages, Footer } from './style'
import TextMessage from '@/components/Messages/Text'
import ImgMessage from '@/components/Messages/Img'
import intl from 'react-intl-universal'
import moment from 'moment'
import Upload from 'rc-upload'
import { TextArea } from 'antd-mobile'

export default function Chat({close}) {
    const [messages, setMessages] = useState([
        {
            type: 'img',
            nicename: '昌吉火锅好吃高唱汇聚天下一家第一关香型到的吗A',
            date: '13:32:34',
            src: '/v1/Tenant/29762/MediaFiles/74277e13-c7b8-4544-a6d9-630d13a17ab15aS05YOPLmpwZWc=?thumbnail=true&compress=2',
        },
        {
            type: 'text',
            nicename: '昌吉火锅好吃高到的吗A',
            date: '13:32:34',
            content: '昌吉火锅好吃'
        },
    ])

    const [active, setActive] = useState(false)
    const [text, setText] = useState('')
    const messagesRef = useRef()

    const handleFocus = () => {
        setActive(!active)
    }

    const handleChange = val => {
        setText(val)
    }
    
    const handleSend = () => {
        if (text.trim().length) {
            console.log(111, text)
            setActive(false)
            setText('')
            // 追加到当前列表
            setMessages(val => [...val, {type: 'text', nicename: Math.random(), date: moment().format('h:mm:ss'), content: text}])
        }
    }

    const scrollToBottom = () => {
        if (messagesRef.current) {
            const scrollHeight = messagesRef.current.scrollHeight; //实例div的实际高度
            const height = messagesRef.current.clientHeight;  //实例可见区域高度
            const maxScrollTop = scrollHeight - height;
            messagesRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
        }
    }
    
    const handleClose = () => {
        close && close()
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return <Container>
        <Header>
            <Title>{intl.get('chat_title')}</Title>
            <CloseIcon onClick={handleClose} className="icon-close"></CloseIcon>
        </Header>
        <Messages ref={messagesRef}>
            {messages.map((item, idx) => item.type === 'text' ? <TextMessage key={idx} data={item}></TextMessage> : <ImgMessage key={idx} data={item} />)}
        </Messages>
        <Footer active={active} textActive={text.trim().length}>
            <Upload 
            >
                <span className="icon-chat-pic"></span>
            </Upload>
            <TextArea
                value={text}
                rows={1}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleFocus}
                ></TextArea>
            <span onClick={handleSend} className="icon-chat-pic"></span>
        </Footer>
    </Container>
}
