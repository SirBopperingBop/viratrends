import React, { useEffect, useState } from 'react';
import {
  Page,
  Navbar,
  NavLeft,
  NavTitle,
  NavTitleLarge,
  NavRight,
  Link,
  Toolbar,
  Block,
  BlockTitle,
  List,
  ListItem,
  Button,
  Panel,
  View
} from 'framework7-react';

const HomePage = ({f7router}) => {
  const goLog = () => {
    f7router.navigate("/login/")
  }
  const [doneLoading, setDoneLoading] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setDoneLoading(true)
    }, 3000);
  }, [])
  return (
    <Page name="home">
      {/* Top Navbar */}
      <Navbar>
          {
            doneLoading ?
            <NavLeft>
              <Link iconIos="f7:menu" iconMd="material:menu" panelOpen="left" />
            </NavLeft>
            :
            <p>Loading...</p>
          }
        <NavTitle>Viratrends</NavTitle>
        <NavRight>
          <Link iconIos="f7:menu" iconMd="material:menu" panelOpen="right" />
        </NavRight>
      </Navbar>
  
      {/* Page content */}
      <Block>
        <p>This is an example of tabs-layout application. The main point of such tabbed layout is that each tab contains independent view with its own routing and navigation.</p>
  
        <p>Each tab/view may have different layout, different navbar type (dynamic, fixed or static) or without navbar like this tab.</p>
      </Block>
      <BlockTitle>Navigation</BlockTitle>
      <List strong inset dividersIos>
        <ListItem link="/about/" title="About"/>
        <ListItem link="/form/" title="Form"/>
      </List>
  
      <BlockTitle>Modals</BlockTitle>
      <Block className="grid grid-cols-2 grid-gap">
        <Button fill popupOpen="#my-popup">Popup</Button>
        <Button fill loginScreenOpen="#my-login-screen">Login Screen</Button>
      </Block>
  
      <BlockTitle>Panels</BlockTitle>
      <Block className="grid grid-cols-2 grid-gap">
        {/* <Button fill panelOpen="left">Left Panel</Button> */}
        <Button fill panelOpen="right">Right Panel</Button>
      </Block>

      {
        doneLoading &&
        <Panel left cover dark>
          <Block>
            <Button fill 
              onClick={goLog}
              panelClose
            >Login</Button>
          </Block>
        </Panel>
      }
  
      <List strong inset dividersIos>
        <ListItem
          title="Dynamic (Component) Route"
          link="/dynamic-route/blog/45/post/125/?foo=bar#about"
        />
        <ListItem
          title="Default Route (404)"
          link="/load-something-that-doesnt-exist/"
        />
        <ListItem
          title="Request Data & Load"
          link="/request-and-load/user/123456/"
        />
      </List>
    </Page>
  );
}
export default HomePage;