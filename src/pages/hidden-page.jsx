import { Block, Button, List, ListItem, NavLeft, NavRight, NavTitle, Navbar, Page, Popover, TextEditor } from "framework7-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../components/app";
import { supabase } from "../js/supabaseClient";

const HiddenPage = ({f7router, user}) => {
    const [cooldown, setCooldown] = useState(false)
    const [logInfo, setLogInfo] = useContext(Context)
    const [chatData, setChatData] = useState()
    const [allUsers, setAllUsers] = useState()
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

    const getUsersData = async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
        setAllUsers(data)
    }
    useEffect(() => {
        getUsersData()
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

    const setOnline = async () => {
        try {
            const { data, error } = await supabase
                .from("users")
                .update({ is_online: true })
                .eq("username", logInfo.username);
            console.log(data, error);
        } catch (error) {
            console.log(error)
        }
        console.log("online");
    }
    const setOffline = async () => {
        try {
            const { data, error } = await supabase
                .from("users")
                .update({ is_online: false })
                .eq("username", logInfo.username);
            console.log(data, error);
        } catch (error) {
            console.log(error)
        }
        console.log("offline");
    }
    document.onvisibilitychange = function () {
        if (document.visibilityState === 'hidden') {
            // setOffline();
            // location.reload();
        }
    }
    const messageChannel = async () => {
        await supabase.channel('messages_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
                console.log(payload)
                getTableData()
            })
            ?.subscribe(
                (response) => {
                    console.log('Subscription response:', response)
                    if (response == "SUBSCRIBED") {
                        setOnline()
                    }
                },
                (error) => console.error('Subscription error:', error)
            )
    }
    const usersChannel = async () => {
        await supabase.channel('users_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
                console.log(payload)
                getUsersData()
            })
            ?.subscribe(
                (response) => {
                    console.log('Subscription response:', response)
                    if (response == "SUBSCRIBED") {
                        setOnline()
                    }
                },
                (error) => console.error('Subscription error:', error)
            )
    }

    useEffect(() => {
        messageChannel()
        usersChannel()
    }, [])

    function padZero(num) {
        return num < 10 ? `0${num}` : `${num}`;
    }
    
    function subtractThreeHours(timeString) {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        let newHours = hours - 3;
        if (newHours < 0) {
            newHours += 24;
        }
        const result = `${padZero(newHours)}:${padZero(minutes)}:${padZero(seconds)}`;
    
        return result;
    }

    return (
        <Page className="hidden">
            <Navbar className="hidden-nav" style={{height: "5vh"}}>
                <NavTitle>Dell and Dandelion</NavTitle>
                <NavRight>
                    <Button
                        popoverOpen="#online"
                        onClick={getUsersData}
                        style={{color: "#74ff7f", backgroundColor: "#74ff802b"}}
                    >{allUsers && allUsers.filter(user => user.is_online == true).length} Online</Button>
                </NavRight>
            </Navbar>
            <Popover
                id="online"
            >
                <List
                    style={{backgroundColor: "#222222"}}
                >
                    {
                        allUsers &&
                        allUsers.map((user, index) => {
                            return (
                                <ListItem
                                    key={index}
                                >
                                    <div style={{color: user.is_online ? "#74ff7f" : "#A5A385", display: "flex", justifyContent: "space-between"}}>
                                    {user.username}</div>
                                </ListItem>
                            )
                        })
                    }
                </List>
            </Popover>
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
                            >
                                <div style={{color: item.username == "Dell" ? "#f47fff" : "#A5A385", display: "flex", justifyContent: "space-between"}}>
                                    {item.username} 
                                    <div
                                        style={{fontSize: "small", color: "grey", margin: "0.2rem"}}
                                    >{subtractThreeHours(item.created_at.substring(11, 19))} {item.created_at.substring(0, 10)}</div>
                                </div>
                                
                                <div className='form-description' dangerouslySetInnerHTML={createMarkup(stripDiamondSymbol(item.content))} />
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