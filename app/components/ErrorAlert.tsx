type ErrorAlertProps = {
  message: string;
};

const ErrorAlert = ({ message }: ErrorAlertProps) => {
  return (
    <div className="rounded-md border border-destructive px-4 py-3 text-sm" role="alert">
      {message}
    </div>
  );
};

export default ErrorAlert;
