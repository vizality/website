import React, { useRef, useEffect, useState, memo } from 'react';

export default memo(({ name, path, heading }) => {
  const fileInputRef = useRef(null);
  const [ dirPath, setDirPath ] = useState(path);

  let fileInput;

  useEffect(() => {
    fileInput = fileInputRef.current;
  });

  return (
    <div className='vz-form-item-wrapper'>
      {heading && <h4 className='vz-form-item-header'>{heading}</h4>}
      <div className='vz-form-item-file-input-wrapper'>
        <input
          type='file'
          className='vz-form-item-file-input'
          id={name}
          ref={fileInputRef}
          onChange={() => setDirPath(fileInput.files[0].path)}
        />
        <label className='vz-form-item-file-input-label' htmlFor={name}>
          {dirPath}
        </label>
      </div>
    </div>
  );
});
