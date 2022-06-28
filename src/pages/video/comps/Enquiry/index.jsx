import React, {useState} from "react";
import { Rate, Tag, TextArea, Button, Space, Toast } from 'antd-mobile'
import intl from 'react-intl-universal'
import './index.scss'

export default function Enquiry(props) {
    const [comment, setComment] = useState('')
    const [score, setScore] = useState(5)
    const [tags, setTags] = useState([])
	const [isVisibleMask, setVisibleMask] = useState(false)

    const handleChangeScore = val => {
        setScore(val)
        setTags([])
    }

    const handleChangeComment = val => {
        setComment(val)
    }

    const handleSend = e => {
		if (3 >= score) {
			if (options.EnquiryCommentEnable) {
				if ((score === 3 && options.EnquiryCommentFor3Score && comment.trim().length < 1)
				|| (score === 2 && options.EnquiryCommentFor2Score && comment.trim().length < 1)
				|| (score === 1 && options.EnquiryCommentFor1Score && comment.trim().length < 1)) {
					Toast.show({
						content: intl.get('rate_comment_nessary'),
						position: 'top',
					})

					return;
				}
			}
			if ((score === 3 && options.EnquiryTagsFor3Score && tags.length < 1)
			|| (score === 2 && options.EnquiryTagsFor2Score && tags.length < 1)
			|| (score === 1 && options.EnquiryTagsFor1Score && tags.length < 1)) {
				Toast.show({
					content: intl.get('rate_tags_nessary'),
					position: 'top',
				})

				return;
			}
		}

		// 组装ws消息
		var ext = {
			type: "agorartcmedia/video",
    		targetSystem: "kefurtc",
			msgtype: {
				visitorEnquiry: {
					tenantId: props.tenantId,
					rtcSessionId: props.rtcSessionId,
					comment,
					score,
					tags: tags.map(item => ({id: item.id, tagName: item.tagName}))
				}
			}
		}

		props.handleSendWs && props.handleSendWs(ext)
		setVisibleMask(true)

        // console.log(1111, e, comment, score, tags, ext)
    }

    const handleTag = tag => {
        if (_.find(tags, {id: tag.id})) {
            var newTags = tags.filter(item => item.id !== tag.id)
            setTags(newTags)
        } else {
            setTags([...tags, tag])
        }
    }

    const scoreItemData = {
        5: intl.get('rate_five'),
        4: intl.get('rate_four'),
        3: intl.get('rate_three'),
        2: intl.get('rate_two'),
        1: intl.get('rate_one')
    }
  
    const options = {}
    const enquiryTags = props.enquiryTags
    props.enquiryOptions.forEach(item => options[item.optionName] = item.optionValue)

    return <div className="enquiry-container">
		<div className="score-top">
			<span>通话已结束</span>
		</div>
		<div className="score-wrapper">
			<div className="score-container">
				{options.EnquiryInviteMsg && <span title={options.EnquiryInviteMsg} className="score-title">{options.EnquiryInviteMsg}</span>}
				<div className="score-content">
					<Rate
						allowClear={false}
						defaultValue={score}
						value={score}
						onChange={handleChangeScore}
					/>
					<span className="score-desc">{scoreItemData[score]}</span>
					{
						enquiryTags && enquiryTags[score] && <div className="score-tags">
							<Space wrap>
							{
								enquiryTags[score].map(tag => {
									var style = _.find(tags, {id: tag.id}) ? {color: '#2189ff', backgroundColor: '#dfeeff'} : {}
									return <Tag key={tag.id} round color='default' style={style} onClick={e => handleTag(tag)}>{tag.tagName}</Tag>
								})
							}
							</Space>
						</div>
					}
				</div>
				<TextArea
					placeholder={intl.get('rate_comment_placeholder')}
					value={comment}
					maxLength={100}
					onChange={handleChangeComment}
					showCount={true}
					></TextArea>
				<div className="button"><Button color="primary" size='small' onClick={handleSend}>{intl.get('rate_button')}</Button></div>
			</div>
			{isVisibleMask && <div className="score-mask">{options.EnquirySolveMsg}</div>}
		</div>
    </div>
}
