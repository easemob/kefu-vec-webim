import React from "react";
import utils from '@/tools/utils'
import { Container }  from './style'

let top = window.top === window.self // false 在iframe里面 true不在

export default function Wrapper(props) {
    return <React.Fragment>
        <Container top={top} className={`${utils.isMobile ? 'full_screen' : ''}`}>{props.children}</Container>
    </React.Fragment>
}
