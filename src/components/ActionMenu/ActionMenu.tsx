import React from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVert from '@mui/icons-material/MoreVert';
type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  action: () => void;
};

type ActionMenuProps = {
  rowId: number | string;
  menuItems: Array<MenuItemProps>;
};

const ActionMenu: React.FC<ActionMenuProps> = ({ rowId, menuItems }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        aria-controls={open ? `menu-${rowId}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        data-testid={`action-menu-${rowId}`}>
        <MoreVert />
      </IconButton>
      <Menu
        id={`menu-${rowId}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': `menu-button-${rowId}`
        }}>
        {menuItems.map((item, index) => (
          <MenuItem
            key={`${rowId}-${index}`}
            onClick={() => {
              item.action();
              handleClose();
            }}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ActionMenu;
