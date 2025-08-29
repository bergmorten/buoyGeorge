from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class SelfTest(_message.Message):
    __slots__ = ("success", "rapport")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    RAPPORT_FIELD_NUMBER: _ClassVar[int]
    success: bool
    rapport: str
    def __init__(self, success: bool = ..., rapport: _Optional[str] = ...) -> None: ...
