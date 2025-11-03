export type ErrorPanelProps = {
  message: string;
};

export const ErrorPanel = (props: ErrorPanelProps) => {
  const { message } = props;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">{message}</p>
      </div>
    </div>
  );
};
