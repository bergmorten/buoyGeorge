from google.protobuf.internal import enum_type_wrapper as _enum_type_wrapper
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Level(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    LEVEL_UNSPECIFIED: _ClassVar[Level]
    LEVEL_DEBUG: _ClassVar[Level]
    LEVEL_INFO: _ClassVar[Level]
    LEVEL_WARNING: _ClassVar[Level]
    LEVEL_ERROR: _ClassVar[Level]
    LEVEL_CRITICAL: _ClassVar[Level]

class Subsystem(int, metaclass=_enum_type_wrapper.EnumTypeWrapper):
    __slots__ = ()
    SUBSYSTEM_UNSPECIFIED: _ClassVar[Subsystem]
    SUBSYSTEM_CPU: _ClassVar[Subsystem]
    SUBSYSTEM_COMMS: _ClassVar[Subsystem]
    SUBSYSTEM_AD2CP: _ClassVar[Subsystem]
    SUBSYSTEM_GNSS: _ClassVar[Subsystem]
LEVEL_UNSPECIFIED: Level
LEVEL_DEBUG: Level
LEVEL_INFO: Level
LEVEL_WARNING: Level
LEVEL_ERROR: Level
LEVEL_CRITICAL: Level
SUBSYSTEM_UNSPECIFIED: Subsystem
SUBSYSTEM_CPU: Subsystem
SUBSYSTEM_COMMS: Subsystem
SUBSYSTEM_AD2CP: Subsystem
SUBSYSTEM_GNSS: Subsystem

class Detailed(_message.Message):
    __slots__ = ("filename", "function", "line", "column")
    FILENAME_FIELD_NUMBER: _ClassVar[int]
    FUNCTION_FIELD_NUMBER: _ClassVar[int]
    LINE_FIELD_NUMBER: _ClassVar[int]
    COLUMN_FIELD_NUMBER: _ClassVar[int]
    filename: str
    function: str
    line: int
    column: int
    def __init__(self, filename: _Optional[str] = ..., function: _Optional[str] = ..., line: _Optional[int] = ..., column: _Optional[int] = ...) -> None: ...

class Entry(_message.Message):
    __slots__ = ("seconds_2025", "level", "subsystem", "message", "detailed")
    SECONDS_2025_FIELD_NUMBER: _ClassVar[int]
    LEVEL_FIELD_NUMBER: _ClassVar[int]
    SUBSYSTEM_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    DETAILED_FIELD_NUMBER: _ClassVar[int]
    seconds_2025: int
    level: Level
    subsystem: Subsystem
    message: str
    detailed: Detailed
    def __init__(self, seconds_2025: _Optional[int] = ..., level: _Optional[_Union[Level, str]] = ..., subsystem: _Optional[_Union[Subsystem, str]] = ..., message: _Optional[str] = ..., detailed: _Optional[_Union[Detailed, _Mapping]] = ...) -> None: ...
