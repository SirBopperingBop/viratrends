import { Block, Button, List, ListItem, NavLeft, NavTitle, Navbar, Page, TextEditor } from "framework7-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../components/app";
import { supabase } from "../js/supabaseClient";

const HiddenPage = ({f7router, user}) => {
    const [cooldown, setCooldown] = useState(false)
    const [logInfo, setLogInfo] = useContext(Context)
    const [chatData, setChatData] = useState()
    const [messageData, setMessageData] = useState({
        username: user.username,
        content: ""
    })

    const handleChange = e => {
        setMessageData(prev => {
            return {
                ...prev,
                content: e
            }
        })
    }
    console.log(messageData);
    const getTableData = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
        setChatData(data)
        setCooldown(false)
    }
    useEffect(() => {
        getTableData()
    }, [])

    const handleSendMessage = async () => {
        if (messageData.content !== "" && cooldown == false) {
            setCooldown(true)
            try {
                const { data, error } = await supabase
                    .from("messages")
                    .upsert(messageData)
                console.log(error, data)
                setMessageData({
                    username: user.username,
                    content: ""
                })
            } catch (error) {
                console.log(error)
            }
        }
    }

    function createMarkup(htlmString) {
        return { __html: htlmString };
    }

    function stripDiamondSymbol(text) {
        let res = text;
        try {
            const lineSeparatorRegex = /\u2028/g;
            res = text.replace(lineSeparatorRegex, '');
        } catch (error) {
            console.log(error);
        }
        return res;
    }
    
    useEffect(() => {
        document.getElementById('LastMessage').scrollIntoView();
    }, [chatData, messageData])


    const createChannel = async () => {
        await supabase.channel('messages_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
                console.log(payload)
                getTableData()
            })
            ?.subscribe(
                (response) => console.log('Subscription response:', response),
                (error) => console.error('Subscription error:', error)
            )
    }

    useEffect(() => {
        createChannel()
    }, [])

    return (
        <Page className="hidden">
            <Navbar className="hidden-nav">
                <NavTitle>Dell and Dandelion</NavTitle>
            </Navbar>
            <Block
                className="chat"
            >
                <List
                    className="chat-list"
                    virtualList
                    virtualListParams={{
                        chatData,
                        height: 70,
                    }}
                >
                        {
                        chatData &&
                        chatData.map((item, index) => (
                            <ListItem
                                key={index}
                                className="message"
                                link="#"
                                // style={{ top: `${vlData.topPosition}px` }}
                                virtualListIndex={chatData.indexOf(item)}
                            ><div style={{color: "#A5A385"}}>{item.username}</div><div className='form-description' dangerouslySetInnerHTML={createMarkup(stripDiamondSymbol(item.content))} />
                            </ListItem>
                        ))}
                        <a id="LastMessage"></a>
                </List>
            </Block>
            <TextEditor
                className="message-box"
                placeholder={"Type a message"}
                buttons={[
                    ['h1', 'bold', 'italic', 'underline', 'strikeThroughs'],
                ]}
                onTextEditorChange={e => handleChange(e)}
                value={messageData?.content || ""}
            />
            <Button
                className="send"
                fill
                style={{backgroundColor: cooldown ? "tomato" : "rgb(165, 163, 133)"}}
                onClick={handleSendMessage}
            >Send</Button>
        </Page>
    )
}

export default HiddenPage;