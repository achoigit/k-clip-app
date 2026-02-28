import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import CustomJamoKeyboard from './CustomJamoKeyboard';

describe('CustomJamoKeyboard', () => {
  it('should show syllable in progress', () => {
    const handleChange = jest.fn();
    render(
      <CustomJamoKeyboard onChange={handleChange} input="" />
    );

    // Simulate pressing 'ㄱ'
    fireEvent.click(screen.getByText('ㄱ'));
    expect(handleChange).toHaveBeenCalledWith('ㄱ')

    // Simulate pressing 'ㅏ'
    fireEvent.click(screen.getByText('ㅏ'));
    expect(handleChange).toHaveBeenCalledWith('가');
  });

  it('should start a new syllable', () => {
    const handleChange = jest.fn();
    render(
      <CustomJamoKeyboard onChange={handleChange} input="가" />
    );

    // Simulate pressing 'ㄱ'
    fireEvent.click(screen.getByText('ㄱ'));
    expect(handleChange).toHaveBeenCalledWith('가ㄱ');

    // Simulate pressing 'ㅏ'
    fireEvent.click(screen.getByText('ㅏ'));
    expect(handleChange).toHaveBeenCalledWith('가가');
  });

  it('should limit syllables to 4 jamo characters', () => {
    const handleChange = jest.fn();
    render(
      <CustomJamoKeyboard onChange={handleChange} input="" />
    );

    // Simulate pressing multiple jamo characters
    fireEvent.click(screen.getByText('ㅈ'));
    fireEvent.click(screen.getByText('ㅜ'));
    fireEvent.click(screen.getByText('ㅎ'));
    fireEvent.click(screen.getByText('ㅗ'));
    fireEvent.click(screen.getByText('ㅏ'));
    fireEvent.click(screen.getByText('ㅇ'));
    fireEvent.click(screen.getByText('ㅅ'));
    fireEvent.click(screen.getByText('ㅐ'));
    fireEvent.click(screen.getByText('ㄱ'));
    expect(handleChange).toHaveBeenCalledWith('주');
    expect(handleChange).toHaveBeenCalledWith('주황');
    expect(handleChange).toHaveBeenCalledWith('주황색');
  });

  it('should handle non-Hangul characters', () => {
    const handleChange = jest.fn();
    render(
      <CustomJamoKeyboard onChange={handleChange} input="" />
    );

    // Simulate pressing a non-Hangul character
    fireEvent.click(screen.getByText('Space'));
    expect(handleChange).toHaveBeenCalledWith(' ');
  });

  it('should switch to shift layout', () => {
    render(
      <CustomJamoKeyboard onChange={() => {}} input="" />
    );

    // Simulate pressing shift
    fireEvent.click(screen.getByText('Shift'));
    expect(screen.getByText('ㅃ')).toBeInTheDocument();
  });

  it('should clear buffer and delete character on backspace', () => {
    const handleChange = jest.fn();
    render(
      <CustomJamoKeyboard onChange={handleChange} input="가" />
    );

    // Simulate pressing backspace
    fireEvent.click(screen.getByText('Backspace'));
    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('should not duplicate characters after backspace then typing', () => {
    const handleChange = jest.fn();
    render(
      <CustomJamoKeyboard onChange={handleChange} input="가" />
    );

    fireEvent.click(screen.getByText('Backspace'));
    fireEvent.click(screen.getByText('ㄴ'));
    fireEvent.click(screen.getByText('ㅏ'));

    expect(handleChange).toHaveBeenLastCalledWith('나');
  });

  it('should handle space and commit buffer', () => {
    const handleChange = jest.fn();
    render(
      <CustomJamoKeyboard onChange={handleChange} input="가" />
    );

    // Simulate pressing space
    fireEvent.click(screen.getByText('Space'));
    expect(handleChange).toHaveBeenCalledWith('가 ');
  });
});