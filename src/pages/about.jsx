import React, { useRef, useState } from 'react';
import { Navbar, Page, BlockTitle, List, ListItem } from 'framework7-react';

const AboutPage = () => {
  const allowInfinite = useRef(true);
  const [items, setItems] = useState([
    20,
    19,
    18,
    17,
    16,
    15,
    14,
    13,
    12,
    11,
    10,
    9,
    8,
    7,
    6,
    5,
    4,
    3,
    2,
    1
  ]);
  const [showPreloader, setShowPreloader] = useState(true);

  const loadMore = () => {
    if (!allowInfinite.current) return;
    allowInfinite.current = false;

    setTimeout(() => {
      if (items.length >= 200) {
        setShowPreloader(false);
        return;
      }

      const itemsLength = items.length;

      for (let i = 1; i <= 20; i += 1) {
        items.unshift(itemsLength + i);
      }
      allowInfinite.current = true;
      setItems([...items]);
    }, 1000);
  };
  return (
    <Page infinite infiniteTop infiniteDistance={50} infinitePreloader={showPreloader} onInfinite={loadMore}>
      <Navbar title="Infinite Scroll"></Navbar>
      <BlockTitle>Scroll bottom</BlockTitle>
      <List strongIos outlineIos dividersIos>
        {items.map((item, index) => (
          <ListItem title={`Item ${item}`} key={index}></ListItem>
        ))}
      </List>
    </Page>
  );
}

export default AboutPage;
