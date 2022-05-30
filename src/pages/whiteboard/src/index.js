import * as React from "react";
import './i18n';
import WhiteboardPage from "./WhiteboardPage";

export default function(props) {
  let {  
    roomUUID: uuid,
    channel: userId,
    roomToken,
    callId,
    appIdentifier,
    ..._props
  } = props;

	const wrapOption = {
		uuid,
		userId,
		roomToken,
		callId,
		appIdentifier
	}

	return <WhiteboardPage {...wrapOption} {..._props} />
}
