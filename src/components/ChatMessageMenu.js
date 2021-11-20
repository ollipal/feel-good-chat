import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import FlagIcon from "@mui/icons-material/Flag";
import PlusOneIcon from "@mui/icons-material/PlusOne";
import InfoSnackBar from "./InfoSnackBar";

export default function ChatMessageMenu({
  photoURL,
  text,
  messageClass,
  positive,
  hidden,
  report,
  handleNice,
  isNice,
  hasUserReported,
  myMessage,
  isRobot,
  toxic,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const [openSB, setOpenSB] = React.useState(false);

  const reportMessage = () => {
    report();
    setOpenSB(true);
    handleClose();
  };

  const nice = () => {
    console.log(handleNice);
    handleNice();
    handleClose();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={`message ${messageClass}${positive}${hidden}`}>
      <img
        onClick={!myMessage && !toxic && !((isNice || isRobot) && hasUserReported) ? handleClick : () => {}}
        src={
          photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
        }
        alt="logo"
      />
      <p onClick={!myMessage && !toxic && !((isNice || isRobot) && hasUserReported) ? handleClick : () => {}}>{text}</p>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        autoFocus={false}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {!isNice && !isRobot && (
          <MenuItem onClick={nice}>
            <ListItemIcon>
              <PlusOneIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Nice message</ListItemText>
          </MenuItem>
        )}
        {!hasUserReported && (
          <MenuItem onClick={reportMessage}>
            <ListItemIcon>
              <FlagIcon fontSize="small" />
            </ListItemIcon>
            {isRobot ? (
              <ListItemText>Report bot</ListItemText>
            ) : (
              <ListItemText>Report message</ListItemText>
            )}
          </MenuItem>
        )}
      </Menu>
      <InfoSnackBar openSB={openSB} setOpenSB={setOpenSB} />
    </div>
  );
}
