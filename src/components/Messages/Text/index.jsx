import React from "react";
import { Content } from './style'
import { Container, Title, Name, Time } from '../style' 

export default function Text({data: {nicename, date, content}}) {
    const pos = 'right';

    return <Container>
        <Title pos={pos}>
            <Name>{nicename}</Name>
            <Time>{date}</Time>
        </Title>
        <Content pos={pos}>{content}</Content>
    </Container>
}
