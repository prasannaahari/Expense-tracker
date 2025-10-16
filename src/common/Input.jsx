function Input({
  label,
  type = "text",
  placeholder = "",
  name,
  id,
  onChange,
  onClick,
  ...props
}) {
  return (
    <div className="mb-2">
      {label && <label htmlFor={id}>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        id={id}
        onChange={onChange}
        onClick={onClick}
        {...props}
        className="form-control"
      />
    </div>
  );
}

export default Input;
