import { Block, Button, List, ListItem, NavLeft, NavRight, NavTitle, Navbar, Page, Popover, TextEditor } from "framework7-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../components/app";
import { supabase } from "../js/supabaseClient";
import { getImage, postImage, removeImage } from "../js/imageFuncs";
import { v4 as uuidv4 } from 'uuid'

const HiddenPage = ({f7router, user}) => {
    const [cooldown, setCooldown] = useState(true)
    const [logInfo, setLogInfo] = useContext(Context)
    const [chatData, setChatData] = useState()
    const [allUsers, setAllUsers] = useState()
    const [contentChange, setContentChange] = useState()
    const [currentChannel, setCurrentChannel] = useState()
    const currentFile = useRef();
    const [messageData, setMessageData] = useState({
        username: user.username,
        recipient: currentChannel,
        content: ""
    })

    const handleChange = e => {
        setMessageData(prev => {
            console.log(currentChannel);
            return {
                ...prev,
                content: e,
            }
        })
        setContentChange(e)
    }
    useEffect(() => {
        setMessageData(prev => {
            return {
                ...prev,
                recipient: currentChannel
            }
        })
    }, [contentChange])
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

    const getUsersData = async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
        setAllUsers(data)
        setCooldown(false)
    }
    useEffect(() => {
        getUsersData()
    }, [])

    const handleSendMessage = async e => {
        if (messageData?.content !== "" || messageData?.media?.file && cooldown == false) {
            setOnline()
            setCooldown(true)
            if (currentFile.current) {
                postImage(currentFile.current, messageData?.media?.file, "", getTableData)
            }
            try {
                const { data, error } = await supabase
                    .from("messages")
                    .upsert(messageData)
                console.log(error, data)
                setMessageData({username: user.username})
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
            getUsersData()
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
        if (document.visibilityState !== 'visible') {
            setOffline();
            if (logInfo.username == "Dell") {
                location.reload();
            }
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
                        getUsersData()
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

    const fileInputRef = useRef(null);

    const handleFileSelect = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const fileId = uuidv4();
        const selectedFile = e?.target?.files?.[0];
        currentFile.current = selectedFile;
        removeImage(messageData?.media?.file)

        setMessageData(prev => {
            return {
                ...prev,
                media: {
                    file: fileId
                }
            }
        })
        console.log('Selected File:', selectedFile);
        setContentChange(e)
    };

    const goTab = (recipient) => {
        setCurrentChannel(recipient)
        setMessageData(prev => {
            return {
                ...prev,
                recipient: currentChannel
            }
        })
    }

    useEffect(() => {
        getUsersData()
    }, [currentChannel])

    return (
        <Page className="hidden">
            <Navbar className="hidden-nav" style={{height: "5vh"}}>
                <NavTitle>{currentChannel == undefined ? "Dell and Dandelion" : `Private messaging ${currentChannel}`}</NavTitle>
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
                    style={{
                        backgroundColor: "#222222",
                    }}
                >
                    {
                        allUsers &&
                        allUsers.map((user, index) => {
                            return (
                                <ListItem
                                    key={index}
                                    className="no-rad"
                                    onClick={() => goTab(user.username)}
                                    style={{
                                        backgroundColor: currentChannel == user.username ? "#424242" : "#222222",
                                    }}
                                >
                                    <div style={{color: user.is_online ? "#74ff7f" : currentChannel == user.username ? "#c5c3b5" : "#a5a3857a", display: "flex", justifyContent: "space-between", borderRadius: 0}}>
                                    {user.username}</div>
                                </ListItem>
                            )
                        })
                    }
                    <ListItem
                        className="no-rad"
                        onClick={() => goTab()}
                        style={{
                            backgroundColor: currentChannel == undefined ? "#424242" : "#222222",
                        }}
                        >
                        <div style={{
                            color: currentChannel == undefined ? "#c5c3b5" : "#a5a3857a",
                            display: "flex", 
                            justifyContent: "space-between",
                            }}>
                        General chat</div>
                    </ListItem>
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
                            chatData.map((rawItem, index) => {
                                let item = false;
                                switch (rawItem.recipient) {
                                    case currentChannel:
                                        if (logInfo.username == rawItem.username) {
                                            item = rawItem
                                        }
                                        break;
                                    case logInfo.username:
                                        if (rawItem.username == currentChannel) {
                                            item = rawItem
                                        }
                                        break;
                                    case null:
                                        if (currentChannel == undefined) {
                                            item = rawItem
                                        }
                                        break
                                    case undefined:
                                        if (currentChannel == undefined) {
                                            item = rawItem
                                        }
                                        break
                                    default:
                                        return
                                        break;
                                }
                                if (item !== false) {
                                    return (
                                        <ListItem
                                            key={index}
                                            className="message"
                                            link="#"
                                            // style={{ top: `${vlData.topPosition}px` }}
                                            virtualListIndex={chatData.indexOf(item)}
                                        >
                                            <div style={{ color: item.username == "Dell" ? "#f47fff" : "#A5A385", display: "flex", justifyContent: "space-between" }}>
                                                {item.username}
                                                <div
                                                    style={{ fontSize: "small", color: "grey", margin: "0.2rem" }}
                                                >{subtractThreeHours(item.created_at.substring(11, 19))} {item.created_at.substring(0, 10)}</div>
                                            </div>
                                            {
                                                item?.media?.file &&
                                                <img src={getImage(item.media.file)} style={{ maxWidth: "100vw" }} />
                                            }
                                            <div className='form-description' dangerouslySetInnerHTML={createMarkup(stripDiamondSymbol(item?.content || ""))} />
                                        </ListItem>
                                    )
                                }
                            })
                        }
                        <a id="LastMessage"></a>
                </List>
            </Block>
            {
                logInfo.username == "Dell" ?
                <></>
                :
                <Button 
                    className="upload"
                    fill
                    style={{backgroundColor: cooldown ? "tomato" : messageData?.media?.file ? "tomato" : "rgb(165, 163, 133)"}}
                    onClick={cooldown ? console.log("fuckin wait") : handleFileSelect}
                >{messageData?.media?.file ? "Change file" : "Upload File"}</Button>
            }
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <TextEditor
                className="message-box"
                buttons={[
                    ['h1', 'bold', 'italic', 'underline', 'strikeThroughs'],
                ]}
                onTextEditorChange={e => handleChange(e)}
                value={messageData?.content || ""}
            />
            <Button
                className="send"
                fill
                style={{backgroundColor: cooldown ? "tomato" : "rgb(77, 120, 77)"}}
                onClick={cooldown ? console.log("fuckin wait") : handleSendMessage}
            >Send</Button>
        </Page>
    )
}

export default HiddenPage;