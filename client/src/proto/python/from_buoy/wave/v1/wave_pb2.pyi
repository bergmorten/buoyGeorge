from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class Profile(_message.Message):
    __slots__ = ("seconds_2025", "significant_wave_height_max_100_parts", "mean_wave_height_100_parts", "mean_wave_height_bf_100_parts", "mean_wave_height_hf_100_parts", "peak_wave_period_100_parts", "mean_wave_period_100_parts", "peak_wave_period_bf_10_parts", "peak_wave_period_hf_10_parts", "zero_crossing_period_100_parts", "number_of_waves", "directional_spread_10_parts", "maximum_period_100_parts", "time_at_hmax_10_parts", "height_of_highest_third_100_parts", "mean_period_of_highest_third_100_parts", "tp_mean_direction_10_parts", "tp_direction_bf_10_parts", "tp_direction_hf_10_parts", "t01_mean_period_10_parts", "t02_mean_period_bf_10_parts", "t02_mean_period_hf_10_parts", "t02_direction_bf_10_parts", "t02_direction_hf_10_parts", "t02_mean_direction_10_parts", "raw_gnss")
    SECONDS_2025_FIELD_NUMBER: _ClassVar[int]
    SIGNIFICANT_WAVE_HEIGHT_MAX_100_PARTS_FIELD_NUMBER: _ClassVar[int]
    MEAN_WAVE_HEIGHT_100_PARTS_FIELD_NUMBER: _ClassVar[int]
    MEAN_WAVE_HEIGHT_BF_100_PARTS_FIELD_NUMBER: _ClassVar[int]
    MEAN_WAVE_HEIGHT_HF_100_PARTS_FIELD_NUMBER: _ClassVar[int]
    PEAK_WAVE_PERIOD_100_PARTS_FIELD_NUMBER: _ClassVar[int]
    MEAN_WAVE_PERIOD_100_PARTS_FIELD_NUMBER: _ClassVar[int]
    PEAK_WAVE_PERIOD_BF_10_PARTS_FIELD_NUMBER: _ClassVar[int]
    PEAK_WAVE_PERIOD_HF_10_PARTS_FIELD_NUMBER: _ClassVar[int]
    ZERO_CROSSING_PERIOD_100_PARTS_FIELD_NUMBER: _ClassVar[int]
    NUMBER_OF_WAVES_FIELD_NUMBER: _ClassVar[int]
    DIRECTIONAL_SPREAD_10_PARTS_FIELD_NUMBER: _ClassVar[int]
    MAXIMUM_PERIOD_100_PARTS_FIELD_NUMBER: _ClassVar[int]
    TIME_AT_HMAX_10_PARTS_FIELD_NUMBER: _ClassVar[int]
    HEIGHT_OF_HIGHEST_THIRD_100_PARTS_FIELD_NUMBER: _ClassVar[int]
    MEAN_PERIOD_OF_HIGHEST_THIRD_100_PARTS_FIELD_NUMBER: _ClassVar[int]
    TP_MEAN_DIRECTION_10_PARTS_FIELD_NUMBER: _ClassVar[int]
    TP_DIRECTION_BF_10_PARTS_FIELD_NUMBER: _ClassVar[int]
    TP_DIRECTION_HF_10_PARTS_FIELD_NUMBER: _ClassVar[int]
    T01_MEAN_PERIOD_10_PARTS_FIELD_NUMBER: _ClassVar[int]
    T02_MEAN_PERIOD_BF_10_PARTS_FIELD_NUMBER: _ClassVar[int]
    T02_MEAN_PERIOD_HF_10_PARTS_FIELD_NUMBER: _ClassVar[int]
    T02_DIRECTION_BF_10_PARTS_FIELD_NUMBER: _ClassVar[int]
    T02_DIRECTION_HF_10_PARTS_FIELD_NUMBER: _ClassVar[int]
    T02_MEAN_DIRECTION_10_PARTS_FIELD_NUMBER: _ClassVar[int]
    RAW_GNSS_FIELD_NUMBER: _ClassVar[int]
    seconds_2025: int
    significant_wave_height_max_100_parts: int
    mean_wave_height_100_parts: int
    mean_wave_height_bf_100_parts: int
    mean_wave_height_hf_100_parts: int
    peak_wave_period_100_parts: int
    mean_wave_period_100_parts: int
    peak_wave_period_bf_10_parts: int
    peak_wave_period_hf_10_parts: int
    zero_crossing_period_100_parts: int
    number_of_waves: int
    directional_spread_10_parts: int
    maximum_period_100_parts: int
    time_at_hmax_10_parts: int
    height_of_highest_third_100_parts: int
    mean_period_of_highest_third_100_parts: int
    tp_mean_direction_10_parts: int
    tp_direction_bf_10_parts: int
    tp_direction_hf_10_parts: int
    t01_mean_period_10_parts: int
    t02_mean_period_bf_10_parts: int
    t02_mean_period_hf_10_parts: int
    t02_direction_bf_10_parts: int
    t02_direction_hf_10_parts: int
    t02_mean_direction_10_parts: int
    raw_gnss: bytes
    def __init__(self, seconds_2025: _Optional[int] = ..., significant_wave_height_max_100_parts: _Optional[int] = ..., mean_wave_height_100_parts: _Optional[int] = ..., mean_wave_height_bf_100_parts: _Optional[int] = ..., mean_wave_height_hf_100_parts: _Optional[int] = ..., peak_wave_period_100_parts: _Optional[int] = ..., mean_wave_period_100_parts: _Optional[int] = ..., peak_wave_period_bf_10_parts: _Optional[int] = ..., peak_wave_period_hf_10_parts: _Optional[int] = ..., zero_crossing_period_100_parts: _Optional[int] = ..., number_of_waves: _Optional[int] = ..., directional_spread_10_parts: _Optional[int] = ..., maximum_period_100_parts: _Optional[int] = ..., time_at_hmax_10_parts: _Optional[int] = ..., height_of_highest_third_100_parts: _Optional[int] = ..., mean_period_of_highest_third_100_parts: _Optional[int] = ..., tp_mean_direction_10_parts: _Optional[int] = ..., tp_direction_bf_10_parts: _Optional[int] = ..., tp_direction_hf_10_parts: _Optional[int] = ..., t01_mean_period_10_parts: _Optional[int] = ..., t02_mean_period_bf_10_parts: _Optional[int] = ..., t02_mean_period_hf_10_parts: _Optional[int] = ..., t02_direction_bf_10_parts: _Optional[int] = ..., t02_direction_hf_10_parts: _Optional[int] = ..., t02_mean_direction_10_parts: _Optional[int] = ..., raw_gnss: _Optional[bytes] = ...) -> None: ...
