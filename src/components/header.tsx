import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { Menu, Row, Col, Button, Drawer, Grid } from "antd";
import router, { useRouter } from "next/router";
import { MenuOutlined } from "@ant-design/icons";
import React from "react";
const { useBreakpoint } = Grid;

export type MenuItem = {
  key: string;
  label: string;
  href: string;
};

export type AppHeaderProps = {
  logoUri: string;
  menuItems: MenuItem[];
  children?: ReactNode;
  darkMode: boolean;
  darkBackground?: string;
  lightBackground?: string;
};

export const Header: React.FC<AppHeaderProps> = ({
  logoUri,
  menuItems,
  children,
  darkMode,
  darkBackground,
  lightBackground,
}) => {
  const screens = useBreakpoint();
  const [current, setCurrent] = useState("home");
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleMenuClick = (event: any) => {
    setCurrent(event.key);
  };

  useEffect(() => {
    setCurrent(router.pathname);
  }, [router.pathname]);

  return (
    <div className={`horizontal-menu-container ${darkMode ? "dark" : "light"}`}>
      <Row justify={"space-between"} align="middle">
        <Col>
          <Link href="/">
            <img
              src={logoUri}
              alt="Logo"
              height="38"
              className="branding-logo"
            />
          </Link>
        </Col>
        {!screens.xs && (
          <Col flex="auto">
            <Menu
              theme={darkMode ? "dark" : "light"}
              mode="horizontal"
              selectedKeys={[current]}
              onClick={handleMenuClick}
              className="horizontal-menu"
            >
              {menuItems.map((item) => (
                <Menu.Item key={item.key}>
                  <Link href={item.href}>{item.label}</Link>
                </Menu.Item>
              ))}
            </Menu>
          </Col>
        )}
        {!screens.xs ? (
          <Col>
            <div className="right-menu-items">{children}</div>
          </Col>
        ) : menuItems.length > 0 ? (
          <Col>
            <Button
              className="drawer-button"
              type="primary"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
            />
            <Drawer
              placement="right"
              closable={true}
              bodyStyle={{ padding: "0px" }}
              onClose={() => setDrawerVisible(false)}
              visible={drawerVisible}
              width="250px"
            >
              <Menu
                className="drawer-menu"
                selectedKeys={[current]}
                onClick={(e) => {
                  handleMenuClick(e);
                  setDrawerVisible(false);
                }}
              >
                {menuItems.map((item) => (
                  <Menu.Item key={item.key}>
                    <Link href={item.href}>{item.label}</Link>
                  </Menu.Item>
                ))}
              </Menu>
              <div className="drawer-children">{children}</div>
            </Drawer>
          </Col>
        ) : (
          <div> {children}</div>
        )}
      </Row>
      <style jsx>{`
        .horizontal-menu-container {
          padding: 0 1%;
          transition: background-color 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          z-index: 1;
          position: relative;
        }
        .horizontal-menu-container.dark {
          background-color: ${darkBackground || "#001528"};
        }
        .horizontal-menu-container.light {
          background-color: ${lightBackground || "#ffffff"};
        }
        .branding-logo {
          padding: 8px;
        }
        .horizontal-menu {
          line-height: 48px;
        }
        .right-menu-items {
          display: flex;
          align-items: center;
          padding: 8px;
          transition: color 0.3s ease;
        }
        .horizontal-menu-container.dark .right-menu-items {
          color: #ffffff;
        }
        .horizontal-menu-container.light .right-menu-items {
          color: #000000;
        }
        .menu-drawer.dark {
          background-color: ${darkBackground || "#001528"};
        }
        .menu-drawer.light {
          background-color: ${lightBackground || "#ffffff"};
        }
        .drawer-button {
          margin-right: 6px;
        }
        .drawer-menu {
          padding: 0;
        }
        .drawer-children {
          position: absolute;
          right: 20px;
          bottom: 20px;
        }
        .drawer-children.dark {
          color: #ffffff;
        }
        .drawer-children.light {
          color: #000000;
        }
      `}</style>
    </div>
  );
};

export default Header;
