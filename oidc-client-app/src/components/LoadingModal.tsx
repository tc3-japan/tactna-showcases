import { Box, CircularProgress, Modal, ModalProps } from "@mui/material";

type OmitModalProps = Omit<ModalProps, "children">;
interface LoadingModalProps extends OmitModalProps {
  children?: React.ReactNode;
}

const LoadingModal = (props: LoadingModalProps) => {
  return (
    <Modal {...props}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
        {props.children}
      </Box>
    </Modal>
  );
};

export default LoadingModal;
