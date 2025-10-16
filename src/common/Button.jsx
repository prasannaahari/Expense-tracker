function Button({ id, type = "button", onClick, label , ...props }) {
  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      className="btn btn-primary"
      {...props}
    >
      {label}
    </button>
  );
}

export default Button;
