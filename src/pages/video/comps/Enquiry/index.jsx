import React, {useState} from "react";
import { Rate, Tag, TextArea, Button, Space, Toast } from 'antd-mobile'
import intl from 'react-intl-universal'
import './index.scss'

// var props = {
//     "enquiryTags": {
//       "2": [
//         {
//           "id": 6,
//           "tenantId": 29676,
//           "score": 2,
//           "tagName": "最多是诗歌汉字啊几十",
//           "createDateTime": "2022-06-15 10:37:30",
//           "updateDateTime": "2022-06-15 10:37:30"
//         }
//       ],
//       "3": [
//         {
//           "id": 3,
//           "tenantId": 29676,
//           "score": 3,
//           "tagName": "最多是诗歌汉字啊几十",
//           "createDateTime": "2022-06-15 10:27:09",
//           "updateDateTime": "2022-06-15 10:27:09"
//         },
//         {
//           "id": 4,
//           "tenantId": 29676,
//           "score": 3,
//           "tagName": "最多是诗歌汉字啊几十",
//           "createDateTime": "2022-06-15 10:27:20",
//           "updateDateTime": "2022-06-15 10:27:20"
//         },
//         {
//             "id": 5,
//             "tenantId": 29676,
//             "score": 3,
//             "tagName": "最多是诗歌汉字啊几十",
//             "createDateTime": "2022-06-15 10:27:20",
//             "updateDateTime": "2022-06-15 10:27:20"
//         },
//         {
//             "id": 7,
//             "tenantId": 29676,
//             "score": 3,
//             "tagName": "最多是诗歌汉字啊几十",
//             "createDateTime": "2022-06-15 10:27:20",
//             "updateDateTime": "2022-06-15 10:27:20"
//         },
//         {
//             "id": 8,
//             "tenantId": 29676,
//             "score": 3,
//             "tagName": "最多是诗歌汉字啊几十",
//             "createDateTime": "2022-06-15 10:27:20",
//             "updateDateTime": "2022-06-15 10:27:20"
//         },
//         {
//             "id": 9,
//             "tenantId": 29676,
//             "score": 3,
//             "tagName": "最多是诗歌汉字啊几十",
//             "createDateTime": "2022-06-15 10:27:20",
//             "updateDateTime": "2022-06-15 10:27:20"
//         },
//       ]
//     },
//     "enquiryOptions": [
//       {
//         "optionId": 3,
//         "tenantId": 29676,
//         "optionName": "EnquiryCommentEnable",
//         "optionValue": "true",
//         "createDateTime": "2022-06-15 02:07:43",
//         "lastUpdateDateTime": "2022-06-15 02:07:43"
//       },
//       {
//         "optionId": 4,
//         "tenantId": 29676,
//         "optionName": "EnquiryDefaultShow5Score",
//         "optionValue": "true",
//         "createDateTime": "2022-06-15 02:07:43",
//         "lastUpdateDateTime": "2022-06-15 02:07:43"
//       },
//       {
//         "optionId": 5,
//         "tenantId": 29676,
//         "optionName": "EnquiryInviteMsg",
//         "optionValue": "请您对我们的服务进行评价：",
//         "createDateTime": "2022-06-15 02:07:43",
//         "lastUpdateDateTime": "2022-06-15 02:07:43"
//       },
//       {
//         "optionId": 6,
//         "tenantId": 29676,
//         "optionName": "EnquirySolveMsg",
//         "optionValue": "感谢您的评价！",
//         "createDateTime": "2022-06-15 02:07:43",
//         "lastUpdateDateTime": "2022-06-15 02:07:43"
//       },
//       {
//         "optionId": 9,
//         "tenantId": 29676,
//         "optionName": "EnquiryTagsFor3Score",
//         "optionValue": "false",
//         "createDateTime": "2022-06-15 02:07:43",
//         "lastUpdateDateTime": "2022-06-15 02:07:43"
//       },
//       {
//         "optionId": 10,
//         "tenantId": 29676,
//         "optionName": "EnquiryCommentFor3Score",
//         "optionValue": "true",
//         "createDateTime": "2022-06-15 02:07:43",
//         "lastUpdateDateTime": "2022-06-15 02:07:43"
//       },
//       {
//         "optionId": 11,
//         "tenantId": 29676,
//         "optionName": "EnquiryTagsFor2Score",
//         "optionValue": "false",
//         "createDateTime": "2022-06-15 02:07:43",
//         "lastUpdateDateTime": "2022-06-15 02:07:43"
//       },
//       {
//         "optionId": 12,
//         "tenantId": 29676,
//         "optionName": "EnquiryCommentFor2Score",
//         "optionValue": "true",
//         "createDateTime": "2022-06-15 02:07:43",
//         "lastUpdateDateTime": "2022-06-15 02:07:43"
//       },
//       {
//         "optionId": 13,
//         "tenantId": 29676,
//         "optionName": "EnquiryTagsFor1Score",
//         "optionValue": "false",
//         "createDateTime": "2022-06-15 02:07:43",
//         "lastUpdateDateTime": "2022-06-15 02:07:43"
//       },
//       {
//         "optionId": 14,
//         "tenantId": 29676,
//         "optionName": "EnquiryCommentFor1Score",
//         "optionValue": "true",
//         "createDateTime": "2022-06-15 02:07:43",
//         "lastUpdateDateTime": "2022-06-15 02:07:43"
//       }
//     ]
// }

export default function Enquiry() {
    const [comment, setComment] = useState('')
    const [score, setScore] = useState(5)
    const [tags, setTags] = useState([])

    const handleChangeScore = val => {
        setScore(val)
        setTags([])
    }

    const handleChangeComment = val => {
        setComment(val)
    }

    const handleSend = e => {
        if (3 >= score) {
            switch(score) {
                case 3:
                    if (options.EnquiryCommentEnable && options.EnquiryCommentFor3Score) {
                        Toast.show({
                            content: '建议必须填写',
                            position: 'top',
                        })
                    }
					if (options.EnquiryTagsFor3Score) {
						Toast.show({
                            content: '标签必须选择',
                            position: 'top',
                        })
					}
					break;
				case 2:
					if (options.EnquiryCommentEnable && options.EnquiryCommentFor2Score) {
                        Toast.show({
                            content: '建议必须填写',
                            position: 'top',
                        })
                    }
					if (options.EnquiryTagsFor2Score) {
						Toast.show({
                            content: '标签必须选择',
                            position: 'top',
                        })
					}
					break;
				case 1:
					if (options.EnquiryCommentEnable && options.EnquiryCommentFor1Score) {
						Toast.show({
							content: '建议必须填写',
							position: 'top',
						})
					}
					if (options.EnquiryTagsFor1Score) {
						Toast.show({
							content: '标签必须选择',
							position: 'top',
						})
					}
					break;
				default:
					break;
            }
        }

		// 组装ws消息
		var ext = {
			type: "agorartcmedia/video",
    		targetSystem: "kefurtc",
			msgtype: {
				visitorEnquiry: {
					comment,
					score,
					tags: tags.map(item => ({id: item.id, tagName: item.tagName}))
				}
			}
		}

        console.log(1111, e, comment, score, tags)
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
                placeholder='请留下您宝贵的建议'
                value={comment}
                maxLength={100}
                onChange={handleChangeComment}
                showCount={true}
                ></TextArea>
            <div className="button"><Button color="primary" size='small' onClick={handleSend}>提交评价</Button></div>
        </div>
    </div>
}
