import * as React from "react";
import Snackbar from '@mui/material/Snackbar';

export default function InfoSnackBar({openSB, setOpenSB}) {
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSB(false);
    };

    return (
        <Snackbar
            open={openSB}
            autoHideDuration={1000}
            onClose={handleClose}
            message="Submitted!"
        />
    );
}