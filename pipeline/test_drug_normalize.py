"""Test drug normalization to ATC classes."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import pytest

def test_sglt2i_mapping():
    from drug_normalize import classify_drug
    assert classify_drug('Dapagliflozin') == ('A10BK01', 'SGLT2 inhibitor', 'hf')
    assert classify_drug('Empagliflozin') == ('A10BK03', 'SGLT2 inhibitor', 'hf')
    assert classify_drug('Canagliflozin') == ('A10BK04', 'SGLT2 inhibitor', 'hf')

def test_arni_mapping():
    from drug_normalize import classify_drug
    assert classify_drug('Sacubitril/Valsartan')[1] == 'ARNI'
    assert classify_drug('Entresto')[1] == 'ARNI'

def test_statin_mapping():
    from drug_normalize import classify_drug
    result = classify_drug('Atorvastatin')
    assert result[1] == 'Statin'
    assert result[2] == 'lipids'

def test_doac_mapping():
    from drug_normalize import classify_drug
    assert classify_drug('Apixaban')[1] == 'DOAC'
    assert classify_drug('Rivaroxaban')[2] == 'af'

def test_beta_blocker():
    from drug_normalize import classify_drug
    assert classify_drug('Metoprolol')[1] == 'Beta blocker'
    assert classify_drug('Carvedilol')[1] == 'Beta blocker'

def test_unknown_drug():
    from drug_normalize import classify_drug
    result = classify_drug('SomeExperimentalDrug123')
    assert result is None

def test_normalize_batch():
    from drug_normalize import classify_drug
    assert classify_drug('dapagliflozin')[1] == 'SGLT2 inhibitor'
    assert classify_drug('ATORVASTATIN')[1] == 'Statin'
    assert classify_drug('  Metoprolol Succinate  ')[1] == 'Beta blocker'

def test_get_drug_class_for_subcategory():
    from drug_normalize import get_classes_for_subcategory
    hf_classes = get_classes_for_subcategory('hf')
    assert 'SGLT2 inhibitor' in hf_classes
    assert 'ARNI' in hf_classes
    assert 'Beta blocker' in hf_classes

def test_none_and_empty():
    from drug_normalize import classify_drug
    assert classify_drug(None) is None
    assert classify_drug('') is None
    assert classify_drug('   ') is None
