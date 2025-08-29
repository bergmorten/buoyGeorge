from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Cell(_message.Message):
    __slots__ = ("direction_10parts", "velocity_100parts", "amplitude_10parts")
    DIRECTION_10PARTS_FIELD_NUMBER: _ClassVar[int]
    VELOCITY_100PARTS_FIELD_NUMBER: _ClassVar[int]
    AMPLITUDE_10PARTS_FIELD_NUMBER: _ClassVar[int]
    direction_10parts: int
    velocity_100parts: int
    amplitude_10parts: int
    def __init__(self, direction_10parts: _Optional[int] = ..., velocity_100parts: _Optional[int] = ..., amplitude_10parts: _Optional[int] = ...) -> None: ...

class Profile(_message.Message):
    __slots__ = ("seconds_2025", "temperature_100parts", "pressure_100parts", "pitch_10parts", "roll_10parts", "velocity_scale", "cells", "raw_ad2cp")
    SECONDS_2025_FIELD_NUMBER: _ClassVar[int]
    TEMPERATURE_100PARTS_FIELD_NUMBER: _ClassVar[int]
    PRESSURE_100PARTS_FIELD_NUMBER: _ClassVar[int]
    PITCH_10PARTS_FIELD_NUMBER: _ClassVar[int]
    ROLL_10PARTS_FIELD_NUMBER: _ClassVar[int]
    VELOCITY_SCALE_FIELD_NUMBER: _ClassVar[int]
    CELLS_FIELD_NUMBER: _ClassVar[int]
    RAW_AD2CP_FIELD_NUMBER: _ClassVar[int]
    seconds_2025: int
    temperature_100parts: int
    pressure_100parts: int
    pitch_10parts: int
    roll_10parts: int
    velocity_scale: int
    cells: _containers.RepeatedCompositeFieldContainer[Cell]
    raw_ad2cp: bytes
    def __init__(self, seconds_2025: _Optional[int] = ..., temperature_100parts: _Optional[int] = ..., pressure_100parts: _Optional[int] = ..., pitch_10parts: _Optional[int] = ..., roll_10parts: _Optional[int] = ..., velocity_scale: _Optional[int] = ..., cells: _Optional[_Iterable[_Union[Cell, _Mapping]]] = ..., raw_ad2cp: _Optional[bytes] = ...) -> None: ...
