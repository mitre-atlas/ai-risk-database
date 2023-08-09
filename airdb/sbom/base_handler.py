""" Base FileHandler class. """
import hashlib
import os
from typing import Optional, Tuple

# TODO: handle gz, zip, tar, bz2, xz, 7z, rar, Z, etc.


class BaseFileHandler(object):
    """Base class for file handlers."""

    filenames: Tuple[
        str, ...
    ] = ()  # a handler might do specific things for these named files
    extensions: Tuple[
        str, ...
    ] = ()  # a handler might do more generic things for these filetypes
    binary_file: Optional[
        bool
    ] = None  # True: binary, False: not be binary, None: no check

    # for use in determining whether a file is a binary file
    _TEXTCHARS = bytearray({7, 8, 9, 10, 12, 13, 27} | set(range(0x20, 0x100)) - {0x7F})

    def handle_if_supported(self, filepath: str) -> Tuple[bool, dict]:
        """Handle a file if it is supported by this handler."""
        try:
            if self.can_handle(filepath):
                if self.binary_file is not None:
                    if self.is_binary_file(filepath) == self.binary_file:
                        return True, self.handle(filepath)
                else:
                    return True, self.handle(filepath)
        except ValueError:
            pass

        # unable to handle this file correctly
        return False, {}

    # subclasses should override this
    def can_handle(self, filename: str) -> bool:
        """Determine if the file is of the type handled by this handler."""
        # .endswith accepts a tuple of suffixes
        return filename in self.filenames or filename.endswith(self.extensions)

    # subclasses can implement their own handle, but this will be called for
    # every file, then updated with the results of the more specific handlers
    def handle(self, filepath: str) -> dict:
        """Handle the file and return a dictionary of relevant information."""
        return {"sha256": self.hashfile(filepath), "size": self.get_file_size(filepath)}

    def hashfile(self, filepath: str) -> str:
        """Return the hash of the file."""
        with open(filepath, "rb") as infile:
            # Read and update hash string value in blocks of 1M
            sha256_hash = hashlib.sha256()
            for byte_block in iter(lambda: infile.read(1048576), b""):
                sha256_hash.update(byte_block)
            readable_hash = sha256_hash.hexdigest()
        return readable_hash

    def hashbytes(self, _bytes: bytes) -> str:
        """Return the hash of the bytes."""
        return hashlib.sha256(_bytes).hexdigest()

    def is_binary_file(self, filename: str, at_most: int = 1000) -> bool:
        """is a file a binary file?"""
        with open(filename, "rb") as infile:
            _bytes = infile.read(at_most)
            return bool(_bytes.translate(None, self._TEXTCHARS))

    def get_file_size(self, filename: str) -> int:
        """get the size of a file"""
        return os.path.getsize(filename)
