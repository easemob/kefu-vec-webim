import styled from "styled-components";

export const Container = styled.div(props => ({
    position: 'absolute',
    width: props.top ? '650px' : '100%',
    height: props.top ? '650px' : '100%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0px 0px 10px #ccc'
}));
