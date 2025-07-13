import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CustomJamoKeyboard from './CustomJamoKeyboard';

describe('CustomJamoKeyboard', () => {
  it('should show syllable in progress', () => {
    const handleChange = jest.fn();
    const { getByText } = render(
      <CustomJamoKeyboard onChange={handleChange} input="" />
    );

    // Simulate pressing 'ㄱ'
    fireEvent.click(getByText('ㄱ'));
    expect(handleChange).toHaveBeenCalledWith('ㄱ')

    // Simulate pressing 'ㅏ'
    fireEvent.click(getByText('ㅏ'));
    expect(handleChange).toHaveBeenCalledWith('가');
  });

  it('should start a new syllable', () => {
    const handleChange = jest.fn();
    const { getByText } = render(
      <CustomJamoKeyboard onChange={handleChange} input="가" />
    );

    // Simulate pressing 'ㄱ'
    fireEvent.click(getByText('ㄱ'));
    expect(handleChange).toHaveBeenCalledWith('가ㄱ');

    // Simulate pressing 'ㅏ'
    fireEvent.click(getByText('ㅏ'));
    expect(handleChange).toHaveBeenCalledWith('가가');
  });

  it('should limit syllables to 4 jamo characters', () => {
    const handleChange = jest.fn();
    const { getByText } = render(
      <CustomJamoKeyboard onChange={handleChange} input="" />
    );

    // Simulate pressing multiple jamo characters
    fireEvent.click(getByText('ㅈ'));
    fireEvent.click(getByText('ㅜ'));
    fireEvent.click(getByText('ㅎ'));
    fireEvent.click(getByText('ㅗ'));
    fireEvent.click(getByText('ㅏ'));
    fireEvent.click(getByText('ㅇ'));
    fireEvent.click(getByText('ㅅ'));
    fireEvent.click(getByText('ㅐ'));
    fireEvent.click(getByText('ㄱ'));
    expect(handleChange).toHaveBeenCalledWith('주');
    expect(handleChange).toHaveBeenCalledWith('주황');
    expect(handleChange).toHaveBeenCalledWith('주황색');
  });

  it('should handle non-Hangul characters', () => {
    const handleChange = jest.fn();
    const { getByText } = render(
      <CustomJamoKeyboard onChange={handleChange} input="" />
    );

    // Simulate pressing a non-Hangul character
    fireEvent.click(getByText('Space'));
    expect(handleChange).toHaveBeenCalledWith(' ');
  });

  it('should switch to shift layout', () => {
    const { getByText } = render(
      <CustomJamoKeyboard onChange={() => {}} input="" />
    );

    // Simulate pressing shift
    fireEvent.click(getByText('Shift'));
    expect(getByText('ㅃ')).toBeInTheDocument();
  });

  it('should clear buffer and delete character on backspace', () => {
    const handleChange = jest.fn();
    const { getByText } = render(
      <CustomJamoKeyboard onChange={handleChange} input="가" />
    );

    // Simulate pressing backspace
    fireEvent.click(getByText('Backspace'));
    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('should handle space and commit buffer', () => {
    const handleChange = jest.fn();
    const { getByText } = render(
      <CustomJamoKeyboard onChange={handleChange} input="가" />
    );

    // Simulate pressing space
    fireEvent.click(getByText('Space'));
    expect(handleChange).toHaveBeenCalledWith('가 ');
  });
});