import type { ReactNode } from "react";
import { useEffect, useContext } from "react";

import type { NavLink } from "@canonical/react-components";
import {
  Icon,
  isNavigationButton,
  Theme,
  Navigation,
} from "@canonical/react-components";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import {
  Link,
  useNavigate,
  useLocation,
  matchPath,
  useMatch,
} from "react-router-dom-v5-compat";

import {
  useCompletedIntro,
  useCompletedUserIntro,
  useGoogleAnalytics,
} from "app/base/hooks";
import ThemePreviewContext from "app/base/theme-preview-context";
import urls from "app/base/urls";
import authSelectors from "app/store/auth/selectors";
import configSelectors from "app/store/config/selectors";
import controllerSelectors from "app/store/controller/selectors";
import type { RootState } from "app/store/root/types";
import { actions as statusActions } from "app/store/status";

type NavItem = {
  adminOnly?: boolean;
  highlight?: string | string[];
  inHardwareMenu?: boolean;
  label: string;
  url: string;
};

const navLinks: NavItem[] = [
  {
    highlight: [
      urls.machines.index,
      urls.machines.machine.index(null),
      urls.pools.index,
      urls.tags.index,
      urls.tags.tag.index(null),
    ],
    inHardwareMenu: true,
    label: "Machines",
    url: urls.machines.index,
  },
  {
    highlight: [urls.devices.index, urls.devices.device.index(null)],
    inHardwareMenu: true,
    label: "Devices",
    url: urls.devices.index,
  },
  {
    adminOnly: true,
    highlight: [
      urls.controllers.index,
      urls.controllers.controller.index(null),
    ],
    inHardwareMenu: true,
    label: "Controllers",
    url: urls.controllers.index,
  },
  {
    inHardwareMenu: true,
    label: "KVM",
    url: urls.kvm.index,
  },
  {
    label: "Images",
    url: urls.images.index,
  },
  {
    highlight: [urls.domains.index, urls.domains.details(null)],
    label: "DNS",
    url: urls.domains.index,
  },
  {
    highlight: [urls.zones.index, urls.zones.details(null)],
    label: "AZs",
    url: urls.zones.index,
  },
  {
    highlight: [
      urls.subnets.index,
      urls.subnets.subnet.index(null),
      urls.subnets.space.index(null),
      urls.subnets.fabric.index(null),
      urls.subnets.vlan.index(null),
    ],
    label: "Subnets",
    url: urls.subnets.index,
  },
  {
    adminOnly: true,
    label: "Settings",
    url: urls.settings.index,
  },
];

const generateLink = (props: NavLink): ReactNode => {
  if (props.url) {
    const { isSelected: _, label, url, ...linkProps } = props;
    return (
      <Link {...linkProps} to={url}>
        {label}
      </Link>
    );
  } else if (isNavigationButton(props)) {
    const { isSelected: _, label, url, ...linkProps } = props;
    return (
      // Handle elements that don't need to navigate using react-router
      // e.g. the logout link.
      <button {...linkProps}>{label}</button>
    );
  }
  return null;
};

const isSelected = (path: string, link: NavItem) => {
  // Use the provided highlight(s) or just use the url.
  let highlights = link.highlight || link.url;
  // If the provided highlights aren't an array then make them one so that we
  // can loop over them.
  if (!Array.isArray(highlights)) {
    highlights = [highlights];
  }
  // Check if one of the highlight urls matches the current path.
  return highlights.some((highlight) =>
    // Check the full path, for both legacy/new clients as sometimes the lists
    // are in one client and the details in the other.
    matchPath({ path: highlight, end: false }, path)
  );
};

const generateItems = (
  links: NavItem[],
  path: string,
  forHardwareMenu: boolean,
  vaultIncomplete: boolean
) => {
  if (forHardwareMenu) {
    // Only include the items for the hardware menu.
    links = links.filter((link) => link.inHardwareMenu);
  }
  return links.map((link) => ({
    className: classNames("p-navigation__item", {
      // Items that are also displayed in the hardware menu need to be hidden
      // when the hardware menu is visible.
      "u-hide--hardware-menu-threshold":
        link.inHardwareMenu && !forHardwareMenu,
    }),
    isSelected: isSelected(path, link),
    key: link.url,
    label:
      link.label === "Controllers" && vaultIncomplete ? ( // check if vault is set up on all controllers
        <>
          <Icon
            className="p-navigation--item-icon"
            data-testid="warning-icon"
            name="warning-grey"
          />
          {link.label}
          {/** Display a warning icon if setup is incomplete */}
        </>
      ) : (
        link.label
      ),
    url: link.url,
  }));
};

export const Header = (): JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector(authSelectors.get);
  const isAdmin = useSelector(authSelectors.isAdmin);
  const configLoaded = useSelector(configSelectors.loaded);
  const location = useLocation();
  const completedIntro = useCompletedIntro();
  const completedUserIntro = useCompletedUserIntro();
  useGoogleAnalytics();
  const isAuthenticated = !!authUser;
  const introMatch = useMatch({ path: urls.intro.index, end: false });
  const isAtIntro = !!introMatch;
  const maasTheme = useSelector(configSelectors.theme);
  const { theme, setTheme } = useContext(ThemePreviewContext);

  // Redirect to the intro pages if not completed.
  useEffect(() => {
    // Check that we're not already at the intro to allow navigation through the
    // intro pages. This is necessary beacuse this useEffect runs every time
    // there is a navigation change as the `navigate` function is regenerated
    // for every route change, see:
    // https://github.com/remix-run/react-router/issues/7634
    if (!isAtIntro && configLoaded) {
      if (!completedIntro) {
        navigate({ pathname: urls.intro.index }, { replace: true });
      } else if (isAuthenticated && !completedUserIntro) {
        navigate({ pathname: urls.intro.user }, { replace: true });
      }
    }
  }, [
    completedIntro,
    completedUserIntro,
    configLoaded,
    isAtIntro,
    isAuthenticated,
    navigate,
  ]);

  useEffect(() => {
    setTheme(maasTheme ? maasTheme : "default");
  }, [location, maasTheme, setTheme]);

  const [unconfiguredControllers, configuredControllers] = useSelector(
    (state: RootState) =>
      controllerSelectors.getVaultConfiguredControllers(state)
  );

  const vaultIncomplete =
    unconfiguredControllers.length >= 1 && configuredControllers.length >= 1;

  // Hide the navigation items when the user is not authenticated or hasn't been
  // through the intro process.
  const showLinks = isAuthenticated && completedIntro && completedUserIntro;
  const links = navLinks
    // Remove the admin only items if the user is not an admin.
    .filter(({ adminOnly }) => !adminOnly || isAdmin);
  const homepageLink = isAdmin
    ? { url: urls.dashboard.index, label: "Homepage" }
    : { url: urls.machines.index, label: "Homepage" };
  const path = location.pathname + location.search;

  return (
    <>
      <a className="p-link--skip" href="#main-content">
        Skip to main content
      </a>
      <Navigation
        className={
          theme
            ? `p-navigation--${theme}`
            : maasTheme
            ? `p-navigation--${maasTheme}`
            : "default"
        }
        generateLink={generateLink}
        items={
          showLinks
            ? [
                {
                  className: "p-navigation__hardware-menu",
                  items: generateItems(links, path, true, vaultIncomplete),
                  label: "Hardware",
                },
                ...generateItems(links, path, false, vaultIncomplete),
              ]
            : null
        }
        itemsRight={
          isAuthenticated
            ? [
                ...(showLinks
                  ? [
                      {
                        isSelected: !!matchPath(
                          { path: urls.preferences.index, end: false },
                          location.pathname
                        ),
                        label: authUser.username,
                        url: urls.preferences.index,
                      },
                    ]
                  : []),
                {
                  label: "Log out",
                  onClick: () => {
                    localStorage.removeItem("maas-config");
                    dispatch(statusActions.logout());
                  },
                },
              ]
            : null
        }
        leftNavProps={{ "aria-label": "main" }}
        logo={{
          "aria-label": homepageLink.label,
          "aria-current": isSelected(path, homepageLink) ? "page" : undefined,
          icon: (
            <svg
              className="p-navigation__logo-icon"
              fill="#fff"
              viewBox="0 0 165.5 174.3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="15.57" cy="111.46" rx="13.44" ry="13.3" />
              <path d="M156.94 101.45H31.88a18.91 18.91 0 0 1 .27 19.55c-.09.16-.2.31-.29.46h125.08a6 6 0 0 0 6.06-5.96v-8.06a6 6 0 0 0-6-6Z" />
              <ellipse cx="15.62" cy="63.98" rx="13.44" ry="13.3" />
              <path d="M156.94 53.77H31.79a18.94 18.94 0 0 1 .42 19.75l-.16.24h124.89a6 6 0 0 0 6.06-5.94v-8.06a6 6 0 0 0-6-6Z" />
              <ellipse cx="16.79" cy="16.5" rx="13.44" ry="13.3" />
              <path d="M156.94 6.5H33.1a19.15 19.15 0 0 1 2.21 5.11A18.82 18.82 0 0 1 33.42 26l-.29.46h123.81a6 6 0 0 0 6.06-5.9V12.5a6 6 0 0 0-6-6Z" />
              <ellipse cx="15.57" cy="158.94" rx="13.44" ry="13.3" />
              <path d="M156.94 149H31.88a18.88 18.88 0 0 1 .27 19.5c-.09.16-.19.31-.29.46h125.08A6 6 0 0 0 163 163v-8.06a6 6 0 0 0-6-6Z" />
            </svg>
          ),
          title: "Canonical MAAS",
          url: homepageLink.url,
        }}
        navProps={{ "aria-label": "primary" }}
        rightNavProps={{ "aria-label": "user" }}
        theme={Theme.DARK}
      />
    </>
  );
};
export default Header;
